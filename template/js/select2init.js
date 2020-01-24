$(document).ready(function () {
	/* Инициализация select2 */
	$(".country_select").select2({
		width: '100%',
		placeholder: (typeof dictionary == "undefined" || typeof dictionary.language == "undefined" ? 'Language!' : dictionary.language),
		templateResult: function (r) {
			var img = $(r.element).data("flag");
			var id = r.id;
			var text = r.text;
			if (!id) {
				id = text;
			}
			if (typeof img == "undefined") {
				img = '';
			}
			if (img) {
				img = '<img src="' + img + '">';
			}
			return $('<span class="flag-icon">' + img + '</span><span class="flag-text">' + text + "</span>");
		},
		templateSelection: function (r) {
			var img = $(r.element).data("flag");
			var id = r.id;
			var text = r.text;
			if (!id) {
				return text;
			}
			if (typeof img == "undefined") {
				img = '';
			}
			if (img) {
				img = '<img src="' + img + '">';
			}
			if ($(r.element).closest("select").data("fulltext")) {
				return $('<span class="flag-icon">' + img + '</span><span class="flag-text">' + text + "</span>");
			}
			return $('<span class="flag-icon">' + img + '</span>');
		},
		dropdownAutoWidth: true,
		dropdownCssClass: function (s) {
			return $(s).attr('class');
		},
		minimumResultsForSearch: -1
	});
	
	$("[name='country']").on('select2:select', function (e) {
		var url = new URL(location.href);
		var query_string = url.search;
		var search_params = new URLSearchParams(query_string);
		search_params.set('lng', e.params.data.id);
		url.search = search_params.toString();
		location.href = url.toString();
	});

});