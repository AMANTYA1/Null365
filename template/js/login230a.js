/* Внимание: используется и в лендингах */
$(document).ready(function () {

	$("#login_form, #register_form, .login_form").submit(function (e) {
        e.preventDefault();
        var form = $(this);
		if (
		(form.find("#register_form_rules").length && !form.find("#register_form_rules").prop("checked")) //Правила
		||
		(form.find("input[name=login]").val() == '' || form.find("input[name=password]").val() == '') //Обязательные поля
		) {
			return false;
		}
		var button = form.find("button[type=submit]");
		var wait_text = (typeof dictionary == "undefined" || typeof dictionary.please_wait == "undefined" ? 'Please, wait!' : dictionary.please_wait);
		$.ajax({
			url: form.attr("action"), 
			dataType: 'json',
            method: 'POST',
            data: form.serialize(),
			beforeSend: function () {
                form.find(".error").removeClass('active');
				button.text(wait_text).prop("disabled", true);
			},
        })
        .done(function (data) {
            if(data.status == 1 || data.error == 'is_auth') {
            	var redirect = form.attr('redirect');
            	if (typeof redirect != "undefined" && redirect !== false) {
            		window.location = window.location.origin + redirect;
            	}
                else {
                	window.location.reload();
                }
            }
            else {
				button.text(button.data("text")).prop("disabled", false);
				form.find(".error")
					.text(data.error)
					.addClass('active');
            }
        })
        .fail(function () {
			form.find(".error")
				.text('The mistake of the request, Try again!')
				.addClass('active');
			button.text(button.data("text")).prop("disabled", false);
        });
    });

});