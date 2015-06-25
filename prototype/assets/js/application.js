/*
 * Custom Module
 * Scoll to fix action-bar
 */
$(function() {
    
    //caches a jQuery object containing the header element
    var header = $('.action-bar');
    var mapHeight = $('.map-container').height();
    $(window).scroll(function() {
        var scroll = $(window).scrollTop();

        if (scroll >= mapHeight) {
            header.addClass('fixed');
        } else {
            header.removeClass('fixed');
        }
    });
});


/*
 * Bootstrap Module
 * Tooltips enabled
 */
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});


/*
 * Custom Module
 * Search-bar animation on focus
 */
$(function () {
    $('.search-field').on('blur', function(){
        $(this).parents('.action-group').removeClass('search-active');
        $(this).removeClass('search-expand');
    }).on('focus', function(){
        $(this).parents('.action-group').addClass('search-active');
        $(this).addClass('search-expand');
    });
});


/*
 * Custom Module
 * Resize and expand map
 */
$('.mapExpand').on('click', function( event ) {
    event.preventDefault();
    $('body').toggleClass('map-expanded');
    window.setTimeout(function(){window.map.invalidateSize();}, 600)
})