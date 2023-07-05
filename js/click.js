var numFaces = 0;
var indexFace = 0;
var prevIndexFace = (indexFace - 1 + numFaces) % numFaces;
var nextIndexFace = (indexFace + 1) % numFaces;
var currentOrigamiContainer;
var currentAngle = 0;
var invisibleCls = "is_invisible";
var hiddenCls = "is_hidden";
var invisibleCls ="is_invisible";
var openCls = "is_open";
var throttle = false;
var origamiCls;
var convertedZ = 0;


$(document).ready(function () {

    // open origami
    $(document).on('click', '.origami_container .origami_face', function () {
        currentOrigamiContainer = $(this).closest('.origami_container');
        if (!currentOrigamiContainer.hasClass(openCls)) {
            currentOrigamiContainer.addClass(openCls)
            numFaces = $('.is_open .origami_face').length;
            currentOrigamiContainer.css('z-index', '99');
            // all other closed origami_containers must not react and disappear
            $('.origami_container').not(currentOrigamiContainer).css({ 'pointer-events': 'none' });
            // $('.origami_container').not(currentOrigamiContainer).addClass(invisibleCls);
            currentOrigamiContainer.find('.origami_header').removeClass([hiddenCls]);
            currentOrigamiContainer.find('.project_container').removeClass([hiddenCls]);
            updateSelected();
        }
        origamiCls = $('.is_open .origami');
    });

    // closing through clicking the closing button 
    $('.origami_close').on('click', function () {
        closeTheOrigami();
    });

    // closing through clicking Esc 
    $(document).on('keydown', function (event) {
        if (event.key === 'Escape') { // Check if the pressed key is 'Escape'
            closeTheOrigami();
        }
    });

    //rotating with a click (slow on touch tap to fix)
    $(document).on('click', '.is_open .origami_face', function () {
        var prevFace = $('.is_open .origami_face').eq(prevIndexFace);
        var nextFace = $('.is_open .origami_face').eq(nextIndexFace);
        if (this === prevFace[0]) {
            rotateOrigami(-1);
        } else if (this === nextFace[0]) {
            rotateOrigami(1);
        }

    });

    $(window).on('keydown', function (event) {
        if ($('.origami_container').hasClass(openCls)) {
            if (!throttle) {
                if (event.key === 'ArrowLeft') {
                    rotateOrigami(-1);
                } else if (event.key === 'ArrowRight') {
                    rotateOrigami(1);
                }
                throttle = true;
                throttling();
            }
        }
    });

    //scroll origami horizontally but only works outside selected scrollable project
    $(window).on('wheel', function (event) {
        if ($('.origami_container').hasClass(openCls)) {
            if (!$('.is_open .origami_face.selected').has(event.target).length) {
                if (!throttle) {
                    if (Math.sign(event.originalEvent.deltaY) === -1) {
                        rotateOrigami(-1);
                    } else if (Math.sign(event.originalEvent.deltaY) === 1) {
                        rotateOrigami(1);
                    }
                    throttle = true;
                    throttling();
                }
            }
        }
    });

});

function updateSelected() {
    prevIndexFace = (indexFace - 1 + numFaces) % numFaces;
    nextIndexFace = (indexFace + 1) % numFaces;
    $('.is_open .origami_face').removeClass(['selected', 'selectable']);
    $('.is_open .origami_face').eq(indexFace).addClass('selected');
    $('.is_open .origami_face').eq(prevIndexFace).addClass('selectable');
    $('.is_open .origami_face').eq(nextIndexFace).addClass('selectable');
}

function closeTheOrigami() {
    currentOrigamiContainer = $('.origami_container.is_open');
    origamiCls = $('.is_open .origami');
    origamiCls.css('transform' , '');; // clear the transform style so that it doesn't bug
    $('.project_container').scrollTop(0);
    $('.origami_face').removeClass('selected');
    currentOrigamiContainer.removeClass(openCls)
    currentOrigamiContainer.css('z-index', '0')
    currentOrigamiContainer.find('.origami_header').addClass(hiddenCls);
    currentOrigamiContainer.find('.project_container').addClass(hiddenCls);
    currentAngle = 0;
    indexFace = 0;
    $('.origami_container').not(currentOrigamiContainer).css({ 'pointer-events': 'auto' });
}

function rotateCarousel() {    
    origamiCls = $('.is_open .origami');
    var currentRotateZ = 'rotateY(' + currentAngle + 'deg)';
    origamiCls.css('transform' , currentRotateZ);
    $('.project_container').animate({
        scrollTop: 0
    }, 500); // 500 is the duration of the animation in milliseconds

}

// left = -1
// right = 1
function rotateOrigami(direction) {
    numFaces = $('.is_open .origami_face').length; // add this line to update the number of faces
    var rotationIndex = 360 / numFaces;
    if (direction < 0) {
        currentAngle += rotationIndex;
        rotateCarousel();
        indexFace = (indexFace - 1 + numFaces) % numFaces;
    } else {
        currentAngle -= rotationIndex;
        rotateCarousel();
        indexFace = (indexFace + 1) % numFaces;
    }
    updateSelected();
}

//throttling function to avoid crazy spin of the origami carousel
function throttling() {
    if (throttle) {
        setTimeout(() => {
            throttle = false;
        }, 300);
    }
}




//swipe rotate (found online) --- to be converted in JQuery

document.addEventListener('touchstart', handleTouchStart, { passive: false });
document.addEventListener('touchmove', handleTouchMove, { passive: false });

var xDown = null;
var yDown = null;

function getTouches(evt) {
    return evt.touches || evt.originalEvent.touches; // jQuery
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
    if (!$('.origami_container').hasClass(openCls) || !xDown || !yDown) {
        return;
    }

    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;
    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
            rotateOrigami(1);
        } else {
            rotateOrigami(-1);
        }
    }

    // Reset touch start coordinates
    xDown = null;
    yDown = null;
}