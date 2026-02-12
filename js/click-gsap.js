var numFaces = 0;
var indexFace = 0;
var prevIndexFace = 0;
var nextIndexFace = 0;
var currentBoxContainer;
var currentAngle = 0;
var hiddenCls = "is_hidden";
var openCls = "is_open";
var throttle = false;
var isAnimating = false;

var cache = {
    origamiContainers: null,
    projectContainers: null
};

$(document).ready(function () {
    cache.origamiContainers = $('.origami_container');
    cache.projectContainers = $('.project_container');
    
    gsap.set('.origami', { force3D: true });
    gsap.set('.origami_face', { force3D: true });

    setupEventListeners();
});

function setupEventListeners() {
    $(document).on('click', '.origami_container .origami_face', handleOrigamiClick);
    $('.origami_close').on('click', closeTheBox);
    $(document).on('keydown', handleKeyDown);
    $(document).on('click', '.is_open .origami_face', handleRotateClick);
    $(window).on('keydown', handleArrowKeys);
    $(window).on('wheel', handleWheel, { passive: false });

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
}

function handleOrigamiClick(e) {
    currentBoxContainer = $(this).closest('.origami_container');
    if (!currentBoxContainer.hasClass(openCls) && !isAnimating) {
        openOrigami();
    }
}

function openOrigami() {
    isAnimating = true;
    currentBoxContainer.addClass(openCls);
    numFaces = currentBoxContainer.find('.origami_face').length;
    
    gsap.to(currentBoxContainer[0], {
        zIndex: 99,
        duration: 0
    });
    
    cache.origamiContainers.not(currentBoxContainer).css('pointer-events', 'none');
    
    var header = currentBoxContainer.find('.origami_header');
    var containers = currentBoxContainer.find('.project_container');
    
    gsap.to(header[0], {
        opacity: 1,
        duration: 0.5,
        delay: 0.8,
        onStart: function() {
            header.removeClass(hiddenCls);
        }
    });
    
    containers.removeClass(hiddenCls);
    
    updateSelected();
    
    setTimeout(function() {
        isAnimating = false;
    }, 800);
}

function handleKeyDown(event) {
    if (event.key === 'Escape') {
        closeTheBox();
    }
}

function handleRotateClick(e) {
    if (isAnimating) return;
    
    var openFaces = $('.is_open .origami_face');
    var prevFace = openFaces.eq(prevIndexFace)[0];
    var nextFace = openFaces.eq(nextIndexFace)[0];
    
    if (this === prevFace) {
        rotateBox(-1);
    } else if (this === nextFace) {
        rotateBox(1);
    }
}

function handleArrowKeys(event) {
    if (!cache.origamiContainers.hasClass(openCls) || throttle || isAnimating) return;
    
    if (event.key === 'ArrowLeft') {
        rotateBox(-1);
        throttle = true;
        throttling();
    } else if (event.key === 'ArrowRight') {
        rotateBox(1);
        throttle = true;
        throttling();
    }
}

function handleWheel(event) {
    if (!cache.origamiContainers.hasClass(openCls) || isAnimating) return;
    
    var selectedFace = $('.is_open .origami_face.selected')[0];
    if (selectedFace && selectedFace.contains(event.target)) return;
    
    if (throttle) return;
    
    var delta = Math.sign(event.originalEvent.deltaY);
    if (delta !== 0) {
        rotateBox(delta);
        throttle = true;
        throttling();
    }
}

function updateSelected() {
    prevIndexFace = (indexFace - 1 + numFaces) % numFaces;
    nextIndexFace = (indexFace + 1) % numFaces;
    
    var faces = $('.is_open .origami_face');
    faces.removeClass('selected selectable');
    faces.eq(indexFace).addClass('selected');
    faces.eq(prevIndexFace).addClass('selectable');
    faces.eq(nextIndexFace).addClass('selectable');
}

function closeTheBox() {
    if (isAnimating) return;
    
    isAnimating = true;
    currentBoxContainer = $('.origami_container.is_open');
    if (!currentBoxContainer.length) return;
    
    var origami = currentBoxContainer.find('.origami')[0];
    
    gsap.to(origami, {
        rotationY: 0,
        x: 0,
        y: 0,
        z: 0,
        duration: 0.8,
        ease: "power2.inOut",
        clearProps: "transform"
    });
    
    resetScrollPosition();
    
    $('.origami_face').removeClass('selected selectable');
    
    gsap.to(currentBoxContainer[0], {
        zIndex: 0,
        duration: 0,
        delay: 0.8
    });
    
    var header = currentBoxContainer.find('.origami_header');
    gsap.to(header[0], {
        opacity: 0,
        duration: 0.3,
        onComplete: function() {
            header.addClass(hiddenCls);
            currentBoxContainer.removeClass(openCls);
        }
    });
    
    currentBoxContainer.find('.project_container').addClass(hiddenCls);
    
    currentAngle = 0;
    indexFace = 0;
    
    cache.origamiContainers.not(currentBoxContainer).css('pointer-events', 'auto');
    
    setTimeout(function() {
        isAnimating = false;
    }, 800);
}

function resetScrollPosition() {
    var containers = document.querySelectorAll('.project_container');
    gsap.to(containers, {
        scrollTop: 0,
        duration: 0.5,
        ease: "power2.out"
    });
}

function rotateCarousel() {
    var selectedBox = document.querySelector('.is_open .origami');
    if (!selectedBox) return;
    
    var sectionId = selectedBox.closest('.origami_container').id;
    var translateZ;
    
    switch(sectionId) {
        case 'web': translateZ = '-30vw'; break;
        case 'illu': translateZ = '-38vw'; break;
        case 'extra': translateZ = '-40vw'; break;
        case 'about': translateZ = '-25vw'; break;
        default: translateZ = '-30vw';
    }
    
    isAnimating = true;
    
    gsap.to(selectedBox, {
        rotationY: currentAngle,
        z: translateZ,
        duration: 0.8,
        ease: "power2.inOut",
        force3D: true,
        onComplete: function() {
            isAnimating = false;
            resetScrollPosition();
        }
    });
}

function rotateBox(direction) {
    if (isAnimating) return;
    
    var rotationIndex = 360 / numFaces;
    
    if (direction < 0) {
        currentAngle += rotationIndex;
        indexFace = (indexFace - 1 + numFaces) % numFaces;
    } else {
        currentAngle -= rotationIndex;
        indexFace = (indexFace + 1) % numFaces;
    }
    
    rotateCarousel();
    updateSelected();
}

function throttling() {
    setTimeout(function() {
        throttle = false;
    }, 300);
}

var xDown = null;
var yDown = null;
var touchThreshold = 50;

function handleTouchStart(evt) {
    if (!cache.origamiContainers.hasClass(openCls)) return;
    
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
}

function handleTouchMove(evt) {
    if (!xDown || !yDown || isAnimating) return;
    
    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;
    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;
    
    if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff) > touchThreshold) {
        evt.preventDefault();
        
        if (xDiff > 0) {
            rotateBox(1);
        } else {
            rotateBox(-1);
        }
        
        xDown = null;
        yDown = null;
    }
}
