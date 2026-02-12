// Advanced GSAP Optimizations

// Initialize GSAP with performance settings
gsap.config({
    force3D: true,
    nullTargetWarn: false
});

// Create reusable timeline for opening animation
var openTimeline = gsap.timeline({ paused: true });

function createOpenAnimation(container) {
    var origami = container.find('.origami')[0];
    var faces = container.find('.origami_face');
    var header = container.find('.origami_header')[0];
    
    var tl = gsap.timeline({
        onStart: function() {
            container.addClass(openCls);
        },
        onComplete: function() {
            isAnimating = false;
        }
    });
    
    tl.to(origami, {
        z: '-30vw',
        duration: 0.8,
        ease: "power2.inOut"
    }, 0)
    .from(faces.toArray(), {
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: "power1.out"
    }, 0.3)
    .to(header, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "back.out(1.2)"
    }, 0.6);
    
    return tl;
}

// Smooth scroll with ScrollToPlugin
function smoothScrollTo(element, position) {
    gsap.to(element, {
        scrollTo: { y: position, autoKill: true },
        duration: 0.5,
        ease: "power2.out"
    });
}

// Parallax effect on origami faces
function addParallaxEffect() {
    gsap.utils.toArray('.origami_face').forEach(face => {
        gsap.to(face, {
            scrollTrigger: {
                trigger: face,
                start: "top bottom",
                end: "bottom top",
                scrub: 1
            },
            y: (i, target) => -50 * (target.offsetTop / window.innerHeight)
        });
    });
}

// Magnetic hover effect for clickable faces
function addMagneticEffect() {
    var faces = document.querySelectorAll('.origami_face');
    
    faces.forEach(face => {
        var bounds = face.getBoundingClientRect();
        
        face.addEventListener('mousemove', function(e) {
            if (face.closest('.is_open')) return;
            
            var x = e.clientX - bounds.left - bounds.width / 2;
            var y = e.clientY - bounds.top - bounds.height / 2;
            
            gsap.to(face, {
                x: x * 0.1,
                y: y * 0.1,
                duration: 0.3,
                ease: "power2.out"
            });
        });
        
        face.addEventListener('mouseleave', function() {
            gsap.to(face, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.3)"
            });
        });
    });
}

// Optimized rotation with momentum
var rotationMomentum = {
    velocity: 0,
    friction: 0.95,
    isActive: false
};

function rotateWithMomentum(direction, speed) {
    rotationMomentum.velocity = direction * (speed || 5);
    
    if (!rotationMomentum.isActive) {
        rotationMomentum.isActive = true;
        applyMomentum();
    }
}

function applyMomentum() {
    if (Math.abs(rotationMomentum.velocity) < 0.1) {
        rotationMomentum.isActive = false;
        rotationMomentum.velocity = 0;
        return;
    }
    
    currentAngle += rotationMomentum.velocity;
    rotationMomentum.velocity *= rotationMomentum.friction;
    
    var selectedBox = document.querySelector('.is_open .origami');
    if (selectedBox) {
        gsap.set(selectedBox, {
            rotationY: currentAngle,
            force3D: true
        });
    }
    
    requestAnimationFrame(applyMomentum);
}

// Batch DOM updates for better performance
function batchUpdate(updates) {
    gsap.set(updates.targets, updates.props);
}

// Example usage:
batchUpdate({
    targets: ['.origami_face'],
    props: { opacity: 1, visibility: 'visible' }
});

// Preload next/previous faces for instant rendering
function preloadAdjacentFaces() {
    var currentFace = $('.is_open .origami_face.selected')[0];
    var prevFace = $('.is_open .origami_face').eq(prevIndexFace)[0];
    var nextFace = $('.is_open .origami_face').eq(nextIndexFace)[0];
    
    // Force GPU layer creation
    gsap.set([prevFace, nextFace], {
        force3D: true,
        willChange: 'transform'
    });
}

// Micro-interactions for better feel
function addMicroInteractions() {
    $('.origami_close').each(function() {
        var btn = this;
        
        btn.addEventListener('mouseenter', function() {
            gsap.to(btn, {
                scale: 1.05,
                duration: 0.3,
                ease: "back.out(2)"
            });
        });
        
        btn.addEventListener('mouseleave', function() {
            gsap.to(btn, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
            });
        });
        
        btn.addEventListener('mousedown', function() {
            gsap.to(btn, {
                scale: 0.95,
                duration: 0.1
            });
        });
        
        btn.addEventListener('mouseup', function() {
            gsap.to(btn, {
                scale: 1.05,
                duration: 0.2,
                ease: "back.out(3)"
            });
        });
    });
}

// Performance monitor
var perfMonitor = {
    fps: 0,
    frames: 0,
    lastTime: performance.now(),
    
    update: function() {
        this.frames++;
        var currentTime = performance.now();
        
        if (currentTime >= this.lastTime + 1000) {
            this.fps = Math.round((this.frames * 1000) / (currentTime - this.lastTime));
            this.frames = 0;
            this.lastTime = currentTime;
            
            // Log FPS if below target
            if (this.fps < 50) {
                console.warn('Low FPS detected:', this.fps);
            }
        }
        
        requestAnimationFrame(this.update.bind(this));
    }
};

// Start monitoring in development
if (window.location.hostname === 'localhost') {
    perfMonitor.update();
}

// Adaptive quality based on device performance
var adaptiveQuality = {
    quality: 'high',
    
    init: function() {
        var fps = this.measureFPS();
        
        if (fps < 30) {
            this.quality = 'low';
            this.applyLowQuality();
        } else if (fps < 50) {
            this.quality = 'medium';
            this.applyMediumQuality();
        }
    },
    
    measureFPS: function() {
        return 60;
    },
    
    applyLowQuality: function() {
        gsap.globalTimeline.timeScale(1.5);
        
        gsap.set('.origami', {
            perspectiveOrigin: '50% 50%'
        });
    },
    
    applyMediumQuality: function() {
        gsap.globalTimeline.timeScale(1.2);
    }
};

// Initialize on load
$(document).ready(function() {
    addMicroInteractions();
    
    // Uncomment for advanced features
    // adaptiveQuality.init();
    // addMagneticEffect();
});

// Export for use in main file
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createOpenAnimation,
        smoothScrollTo,
        rotateWithMomentum,
        batchUpdate,
        preloadAdjacentFaces,
        addMicroInteractions
    };
}
