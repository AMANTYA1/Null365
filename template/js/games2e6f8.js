$(document).ready(function () {
	
	var block = true;
    var page = 0;
	var lastsearch = '';

    $(window).scroll(function () {
        if ($(window).height() + $(window).scrollTop() >= ($(document).height() - 380) && block) {
            block = false;
            page++;
			var delimiter = (window.location.href.indexOf('?') == -1 ? '?' : '&');
            $.ajax({
                type: 'GET',
                url: window.location.href + delimiter + 'page=' + page,
                success: function (list) {
                    if (list == '') {
                        block = false;
                    } else {
                        $('.casino-grid').append(list);
                        block = true;
                    }
                }
            });
        }
    });
	
	$('.js-menu-input, .js-menu-btn-search').on('click input', function (e) {
		var text = $('.games-search-field__input:visible').val();
		if (text == '' && lastsearch == '') {
			return false;
		}
		if (text.length > 50) {
			return false;
		}
		lastsearch = text;
		$('.games-search-field__input:hidden').val(text);
		page = 0;
		block = true;
		window.history.pushState('Object', 'Title', '/games?type=all&search=' + text);
		$("#casino_providers").val("-");
		$(".casinomenu.item--active").removeClass("item--active");
		$(".casinomenu.all").addClass("item--active")
							.find(".desc").text($(".casinomenu.all").data("default"));
		$.ajax({
			type: 'GET',
			url: window.location.href,
			success: function (list) {
				if (list != '') {
					$('.casino-grid').html(list);
				}
			}
		});
	});
	
	$("body").on('click', '.addfavorite', function () {
		var data = '';
		if ($(this).hasClass('fav-icon--active')) {
			data = 'delfavorite=' + $(this).data("game-id");
			$(this).removeClass('fav-icon--active');
		}
		else {
			data = 'addfavorite=' + $(this).data("game-id");
			$(this).addClass('fav-icon--active');
		}
		$.ajax({
			type: 'POST',
			url: window.location.href,
			data: data
		});
	});

});

function changeUrl(url) {
	window.history.pushState('Object', 'Title', url);
}