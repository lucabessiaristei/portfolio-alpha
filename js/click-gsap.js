// EASING CUSTOMIZATION GUIDE:
// 
// 'none' - completamente lineare, nessun ease
// 'power1.inOut' - ease molto leggero 
// 'power2.inOut' - ease medio (default GSAP)
// 'power3.inOut' - ease pronunciato
// 'power1.out' - snappy, veloce all'inizio
// 'expo.out' - molto snappy e decisivo
//
// Modifica le costanti sotto per cambiare il comportamento

gsap.registerPlugin(ScrollToPlugin);

var numFaces = 0;
var indexFace = 0;
var prevIndexFace = (indexFace - 1 + numFaces) % numFaces;
var nextIndexFace = (indexFace + 1) % numFaces;
var currentBoxContainer;
var currentAngle = 0;
var hiddenCls = "is_hidden";
var openCls = "is_open";
var throttle = false;
var isAnimating = false;

const ANIMATION_DURATION = 0.5;
const ROTATION_DURATION = 0.5;

const EASE_CONTAINER = 'power1.in';  // apertura/chiusura container (più diretto)
const EASE_FADE = 'none';                // fade in/out elementi (lineare)
const EASE_ROTATION = 'power1.inOut';      // rotazione carousel (più snappy)

$(document).ready(function () {

    // Initialize all containers with proper hidden state
    $('.origami_container').each(function() {
        $(this).find('.origami_header').addClass(hiddenCls);
        $(this).find('.project_container').addClass(hiddenCls);
        gsap.set($(this).find('.origami_header'), { autoAlpha: 0 });
        gsap.set($(this).find('.project_container'), { autoAlpha: 0 });
    });

    $(document).on('click', '.origami_container .origami_face', function () {
        if (isAnimating) return;
        
        currentBoxContainer = $(this).closest('.origami_container');
        if (!currentBoxContainer.hasClass(openCls)) {
            openOrigami(currentBoxContainer);
        }
    });

    $('.origami_close').on('click', function () {
        if (!isAnimating) {
            closeTheBox();
        }
    });

    $(document).on('keydown', function (event) {
        if (event.key === 'Escape' && !isAnimating) {
            closeTheBox();
        }
    });

    $(document).on('click', '.is_open .origami_face', function () {
        if (isAnimating) return;
        
        var prevFace = $('.is_open .origami_face').eq(prevIndexFace);
        var nextFace = $('.is_open .origami_face').eq(nextIndexFace);
        if (this === prevFace[0]) {
            rotateBox(-1);
        } else if (this === nextFace[0]) {
            rotateBox(1);
        }
    });

    $(window).on('keydown', function (event) {
        if ($('.origami_container').hasClass(openCls)) {
            if (!throttle && !isAnimating) {
                if (event.key === 'ArrowLeft') {
                    rotateBox(-1);
                } else if (event.key === 'ArrowRight') {
                    rotateBox(1);
                }
                throttle = true;
                throttling();
            }
        }
    });

    $(window).on('wheel', function (event) {
        if ($('.origami_container').hasClass(openCls)) {
            if (!$('.is_open .origami_face.selected').has(event.target).length) {
                if (!throttle && !isAnimating) {
                    if (Math.sign(event.originalEvent.deltaY) === -1) {
                        rotateBox(-1);
                    } else if (Math.sign(event.originalEvent.deltaY) === 1) {
                        rotateBox(1);
                    }
                    throttle = true;
                    throttling();
                }
            }
        }
    });

});

function openOrigami(container) {
    isAnimating = true;
    currentBoxContainer = container;
    
    // Save original dimensions
    const originalWidth = currentBoxContainer.css('width');
    const originalHeight = currentBoxContainer.css('height');
    currentBoxContainer.data('original-width', originalWidth);
    currentBoxContainer.data('original-height', originalHeight);
    
    currentBoxContainer.addClass(openCls);
    numFaces = currentBoxContainer.find('.origami_face').length;
    currentBoxContainer.css('z-index', '99');
    $('.origami_container').not(currentBoxContainer).css({ 'pointer-events': 'none' });

    const tl = gsap.timeline({
        onComplete: () => {
            isAnimating = false;
            updateSelected();
        }
    });

    tl.to(currentBoxContainer[0], {
        duration: ANIMATION_DURATION,
        width: '40vw',
        height: '75%',
        y: '-2rem',
        ease: EASE_CONTAINER
    }, 0);

    currentBoxContainer.find('.origami_header').removeClass(hiddenCls);
    currentBoxContainer.find('.project_container').removeClass(hiddenCls);

    tl.to(currentBoxContainer.find('.origami_header')[0], {
        duration: ANIMATION_DURATION * 0.6,
        autoAlpha: 1,
        ease: EASE_FADE
    }, ANIMATION_DURATION * 0.4);

    tl.to(currentBoxContainer.find('.project_container').toArray(), {
        duration: ANIMATION_DURATION * 0.6,
        autoAlpha: 1,
        ease: EASE_FADE
    }, ANIMATION_DURATION * 0.4);

    tl.to(currentBoxContainer.find('.origami_face::before'), {
        duration: ANIMATION_DURATION * 0.3,
        autoAlpha: 0,
        ease: EASE_FADE
    }, 0);
}

function closeTheBox() {
    isAnimating = true;
    currentBoxContainer = $('.origami_container.is_open');
    var origami = currentBoxContainer.find('.origami')[0];

    gsap.to('.project_container', {
        scrollTo: { y: 0 },
        duration: 0.3,
        ease: EASE_FADE
    });

    $('.origami_face').removeClass('selected selectable');

    const tl = gsap.timeline({
        onComplete: () => {
            currentBoxContainer.removeClass(openCls);
            currentBoxContainer.css('z-index', '0');
            currentBoxContainer.find('.origami_header').addClass(hiddenCls);
            currentBoxContainer.find('.project_container').addClass(hiddenCls);
            
            // Clear all GSAP inline styles
            gsap.set(origami, { clearProps: 'all' });
            gsap.set(currentBoxContainer[0], { clearProps: 'all' });
            gsap.set(currentBoxContainer.find('.origami_header')[0], { clearProps: 'all' });
            gsap.set(currentBoxContainer.find('.project_container').toArray(), { clearProps: 'all' });
            
            currentAngle = 0;
            indexFace = 0;
            $('.origami_container').not(currentBoxContainer).css({ 'pointer-events': 'auto' });
            isAnimating = false;
        }
    });

    tl.to(currentBoxContainer.find('.origami_header')[0], {
        duration: ANIMATION_DURATION * 0.4,
        autoAlpha: 0,
        ease: EASE_FADE
    }, 0);

    tl.to(currentBoxContainer.find('.project_container').toArray(), {
        duration: ANIMATION_DURATION * 0.4,
        autoAlpha: 0,
        ease: EASE_FADE
    }, 0);

    tl.to(currentBoxContainer[0], {
        duration: ANIMATION_DURATION,
        width: currentBoxContainer.data('original-width'),
        height: currentBoxContainer.data('original-height'),
        y: 0,
        ease: EASE_CONTAINER
    }, ANIMATION_DURATION * 0.2);
}

function updateSelected() {
    prevIndexFace = (indexFace - 1 + numFaces) % numFaces;
    nextIndexFace = (indexFace + 1) % numFaces;
    $('.is_open .origami_face').removeClass(['selected', 'selectable']);
    $('.is_open .origami_face').eq(indexFace).addClass('selected');
    $('.is_open .origami_face').eq(prevIndexFace).addClass('selectable');
    $('.is_open .origami_face').eq(nextIndexFace).addClass('selectable');
}

function rotateCarousel() {
    var selectedBox = document.querySelector('.is_open .origami');

    var hasWebAncestor = $(selectedBox).parents('#web').length > 0;
    var hasIlluAncestor = $(selectedBox).parents('#illu').length > 0;
    var hasExtraAncestor = $(selectedBox).parents('#extra').length > 0;
    var hasAboutAncestor = $(selectedBox).parents('#about').length > 0;

    let translateZ;
    if (hasWebAncestor) translateZ = '-30vw';
    else if (hasIlluAncestor) translateZ = '-38vw';
    else if (hasExtraAncestor) translateZ = '-40vw';
    else if (hasAboutAncestor) translateZ = '-25vw';

    gsap.to(selectedBox, {
        duration: ROTATION_DURATION,
        rotationY: currentAngle,
        transformOrigin: 'center center',
        ease: EASE_ROTATION,
        force3D: true
    });

    gsap.to('.project_container', {
        scrollTo: { y: 0 },
        duration: ROTATION_DURATION,
        ease: EASE_FADE
    });
}

function rotateBox(direction) {
    if (isAnimating) return;
    
    isAnimating = true;
    numFaces = $('.is_open .origami_face').length;
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
    
    setTimeout(() => {
        isAnimating = false;
    }, ROTATION_DURATION * 1000);
}

function throttling() {
    if (throttle) {
        setTimeout(() => {
            throttle = false;
        }, 300);
    }
}

document.addEventListener('touchstart', handleTouchStart, { passive: false });
document.addEventListener('touchmove', handleTouchMove, { passive: false });

var xDown = null;
var yDown = null;

function getTouches(evt) {
    return evt.touches || evt.originalEvent.touches;
}

function handleTouchStart(evt) {
    if (!$('.origami_container').hasClass(openCls)) {
        return;
    }

    const firstTouch = getTouches(evt)[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;

    evt.target.setPointerCapture(firstTouch.pointerId);
}

function handleTouchMove(evt) {
    if (!$('.origami_container').hasClass(openCls) || !xDown || !yDown || isAnimating) {
        return;
    }

    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;
    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
            rotateBox(1);
        } else {
            rotateBox(-1);
        }
    }

    xDown = null;
    yDown = null;
}
