$(function() {
    $('.js-game-fullscreen').on('click', function (e) {
        if ($('.game-container').hasClass('game-container--active')) {
            $('.game-container').removeClass('game-container--active')
        } else {
            $('.game-container').addClass('game-container--active')
        }
    });
});