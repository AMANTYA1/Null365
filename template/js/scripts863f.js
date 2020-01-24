//
$(function () {
    var tabs = (function () {

        jQuery.fn.lightTabs = function (options) {

            var createTabs = function () {
                var tabs = this;
                var i = 0;

                var showPage = function (i) {
                    $(tabs).children("div").children("div").removeClass("tabs__content-item--visible");
                    $(tabs).children("div").children("div").eq(i).addClass("tabs__content-item--visible");
                    $(tabs).children("ul").children("li").removeClass("tabs__item--active");
                    $(tabs).children("ul").children("li").eq(i).addClass("tabs__item--active");
                }

                $(tabs).children("ul").children("li").each(function (index, element) {
                    $(element).attr("data-page", i);
                    i++;
                });

                $(tabs).children("ul").children("li").click(function () {
                    showPage(parseInt($(this).attr("data-page")));
                });
            };
            return this.each(createTabs);

        };

        $(document).ready(function () {
            $(".js-tabs-default").lightTabs();
            $(".js-tabs-pay").lightTabs();
        });
    })();

    /* Обновляем выведенные даты на пользовательские */
    $(".tousertime").each(function () {
        $(this).text(userTimeConvert($.trim($(this).text())));
    });

    //ping
    setTimeout(pingstop, 15000);

});

// function pingstop() {
// 		$.ajax({
// 			url: '/ping.php', 
// 			dataType: 'json',
//             method: 'GET'
//         })
//         .done(function (data) {
//             if(data.status == 'stop') {
//                 window.location.reload();
//             }
// 			else {
// 				setTimeout(pingstop, 15000);
// 			}
//         })
//         .fail(function () {
// 			window.location.reload();
//         });
// }

var live_search = $('#live_search').is(':checked');
var line_search = $('#line_search').is(':checked');

function initSearchDropdownScroll() {
    if ($('.result-find .select2-results .select2-results__options').length) {

        if ($('.result-find .select2-results .mCustomScrollBox').length) {
            $('.result-find .select2-results .select2-results__options').mCustomScrollbar("destroy");
        }

        setTimeout(function () {

            $('.result-find .select2-results .select2-results__options').mCustomScrollbar({
                axis: 'y',
                //autoHideScrollbar: true,
                advanced: { autoExpandHorizontalScroll: true }
            });

        }, 1000);

    }
}

var objGetListFind = {
    width: '100%',
    language: lang,
    dir: lang_dir,
    ajax: {
        url: "/ajax/search.php",
        dataType: 'json',
        delay: 250,
        data: function (params) {
            return {
                q: params.term,
                page: params.page,
                live: live_search | 0,
                line: line_search | 0,
            };
        },
        processResults: function (data, page) {
            initSearchDropdownScroll();
            return {
                results: data.items
            };
        },
        cache: true
    },
    minimumInputLength: 3,
    minimumResultsForSearch: -1,
    allowClear: true,
    templateResult: formatIds,
    placeholder: dictionary.bet_place,
    dropdownCssClass: 'result-find',
    dropdownParent: $('.live-panel'),
    escapeMarkup: function (markup) {
        return markup;
    }
};

$(document).ready(function () {

    var search = $('.js-search');

    search.select2(objGetListFind);

    search.on('select2:open', function (e) {
        $('.live-panel').addClass('live-panel--search');
    });

    search.on('select2:close', function (e) {
        if ($('.result-find .select2-results .mCustomScrollBox').length) {
            console.log('lol');
            $('.result-find .select2-results .select2-results__options').mCustomScrollbar("destroy");
        }

        $('.live-panel').removeClass('live-panel--search');

        if (typeof e.params.originalSelect2Event != 'undefined' && typeof e.params.originalSelect2Event.data != 'undefined') {
            var data = e.params.originalSelect2Event.data;
            if (data.id != 'undefined') {
                window.location = '/event&eventId=' + data.id + '&live=' + data.live;
                return false;
            }
        }
    });


    $(document).on('click', '.js-checkboxPopupIsVisible', function (e) {
        if (!$(e.target).closest(".live-panel__checkbox-popup").length) {
            $(this).find('.live-panel__checkbox-popup').toggleClass('live-panel__checkbox-popup--visible');
            live_search = $('#live_search').is(':checked');
            line_search = $('#line_search').is(':checked');
        }
    });
    $(document).on('click', function (e) {
        if ($('.live-panel__checkbox-popup').length) {
            if (!$(e.target).closest(".live-panel__checkbox-wrap, .live-panel__checkbox-popup").length) {
                $('.live-panel__checkbox-popup').removeClass('live-panel__checkbox-popup--visible');
                live_search = $('#live_search').is(':checked');
                line_search = $('#line_search').is(':checked');
            }
            e.stopPropagation();
        }
    });

    $('.nav-resize').click(function () {
        if (!$(this).is('.active')) {
            if ($('.rightbar').is('.active')) {
                $('.action-rightbar, .rightbar').removeClass('active');
            }
            $(this).addClass('active');
            $('.leftbar, .fade, body').addClass('active');
        } else {
            $('.leftbar, .fade, body').removeClass('active');
            $(this).removeClass('active');
        }
        return false;
    });

    $(document).keyup(function (e) {
        if (e.keyCode === 27) {
            if ($('.popup').is('.active')) {
                closePopup();
            }
            if ($('.select').is('.active')) {
                $('.select').removeClass('active');
            }
            if ($('.nav').is('.active')) {
                $('.nav').removeClass('active');
            }
        }
    });

    $(document).on('click touchend', 'body', function (e) {
        var target = e.srcElement || e.target;
        if ($('.nav').is('.active')) {
            $('.nav').removeClass('active');
        }
        if ($('.select').is('.active')) {
            $('.select').removeClass('active');
        }
    });


    $(document).on('click', '.leftbar .subitem', function (e) {
        $('.bets').html('<div class="preloader"><div class="pulse"></div></div>');
        gameArr = {}, toursArr = {}, eventsArr = {}, betsArr = {};

        $('.leftbar .subitem').removeClass('active');

        if ($(this).is('.active')) {
            $(this).removeClass('active');
            sportId = $(this).data('sport-id');
            tourId = '', country = 1;
        } else {
            $(this).addClass('active');
            sportId = $(this).data('sport-id');
            tourId = $(this).data('id');
            country = '1';
        }
        clearInterval(timerSport);
        emptyBet = 1;
        gameArr = {}, toursArr = {}, eventsArr = {}, betsArr = {};
        getLine();
        timerSport = setInterval(function () { getLine(); }, lineInterval);
    });

    $(document).on('click', '.filters__item-link-a', function (e) {
        $('.bets').html('<div class="preloader"><div class="pulse"></div></div>');
        gameArr = {}, toursArr = {}, eventsArr = {}, betsArr = {};
        if ($(this).is('.active')) {
            $(this).removeClass('active');
            if ($(this).hasClass('sport')) {
                sportId = '', tourId = '', country = 1;
            }
        } else {
            if ($(this).hasClass('sport')) {
                sportId = $(this).data('id');
                tourId = '', country = 1;
            }
            $('.leftbar .block .item').removeClass('active');

            $(this).addClass('active');
        }
        console.log($(this).data('id'));
        clearInterval(timerSport);
        emptyBet = 1;
        gameArr = {}, toursArr = {}, eventsArr = {}, betsArr = {};
        getLine();
        timerSport = setInterval(function () { getLine(); }, lineInterval);
        setTimeout(function () {
            initLeftBarScroll();
        }, 450);
        return false;
    });

    $(document).on('click', '.leftbar .block div.item', function (e) {
        if (!$(".bodyContainer .bets").is("div")) {
            $(".bodyContainer").html($("<div>", { class: 'bets' }));
            $('.bets_container').remove();
        }
        $('.bets').html('<div class="preloader"><div class="pulse"></div></div>');
        gameArr = {}, toursArr = {}, eventsArr = {}, betsArr = {};
        if ($(this).is('.active')) {
            $('.leftbar .block .sublist').height(0);
            $(this).removeClass('active');
            if ($(this).hasClass('sport')) {
                sportId = '', tourId = '', country = 1;
            }
        } else {
            if ($(this).hasClass('sport')) {
                sportId = $(this).data('id');
                tourId = '', country = 1;
            }
            $('.leftbar .block .sublist').height(0);
            $('.leftbar .block .item').removeClass('active');

            $(this).find('.sublist').height($(this).find('.height').height());
            $(this).addClass('active');
        }
        if (typeof timerEvent != "undefined") {
            clearInterval(timerEvent);
        }
        if (typeof timerSport != "undefined") {
            clearInterval(timerSport);
        }
        emptyBet = 1;
        gameArr = {}, toursArr = {}, eventsArr = {}, betsArr = {};
        getLine();
        timerSport = setInterval(function () {
            getLine();
        }, lineInterval);
        setTimeout(function () {
            initLeftBarScroll();
        }, 450);
        return false;
    });

    $(document).on('click', '.leftbar .block .subitem', function (e) {
        $('.leftbar').removeClass('active');
        $('.fade').removeClass('active');
        $('body').removeClass('active');
        return false;
    });


    $(window).resize(function () {
        initLeftBarScroll();
        initRightBarScroll();
        initLeftBarScrollSecond();
        initFiltersScroll();
    }).resize();

    if ($('.slider').length) {
        var rtl = (lang_dir == 'rtl') ? true : false;
        var slider = $('.slider .list').lightSlider({
            item: 1,
            pager: false,
            loop: true,
            auto: true,
            pause: 3000,
            controls: false,
            rtl: rtl,
        });
        $('.slider .next').on('click', function () {
            slider.goToNextSlide();
            return false;
        });
        $('.slider .prev').on('click', function () {
            slider.goToPrevSlide();
            return false;
        });
    }


    if ($('.input-tel').length) {
        var input = document.querySelector('.input-tel');
        window.intlTelInput(input, {
            utilsScript: 'template/js/utils.js',
            onlyCountries: ["al", "ad", "at", "by", "be", "ba", "bg", "hr", "cz", "dk",
                "ee", "fo", "fi", "fr", "de", "gi", "gr", "va", "hu", "in", "is", "ie", "ir", "it", "lv",
                "li", "lt", "lu", "mk", "mt", "md", "mc", "me", "nl", "no", "pl", "pt", "ro",
                "ru", "sm", "rs", "sk", "si", "es", "se", "ch", "ua", "uz", "gb"],
            autoHideDialCode: true,
            autoPlaceholder: false,
            initialCountry: 'in',
            separateDialCode: false,
            nationalMode: false,
        });
        initTelScroll();
    }


    $(document).on('click touchend', '.select .current', function (e) {
        if ($(this).parent().is('.active')) {
            $(this).parent().removeClass('active');
        } else {
            if ($('.select').is('.active')) {
                $('.select').removeClass('active');
            }

            $(this).parent().addClass('active');
        }
        return false;
    });

    $(document).on('click touchend', '.select .dropdown .select-item', function (e) {
        $(this).parent().parent().find('.current').attr('data-value', $(this).attr('data-value'));
        $(this).parent().parent().find('.current').html($(this).html());
        $('.select').removeClass('active');
        return false;
    });

    $(document).on('click touchend', '.action-rightbar', function (e) {
        if (!$(this).is('.active')) {
            if ($('.leftbar').is('.active')) {
                $('.action-leftbar, .leftbar').removeClass('active');
            }
            $(this).addClass('active');
            $('.rightbar, .fade, body').addClass('active');
        } else {
            $('.rightbar, .fade, body').removeClass('active');
            $(this).removeClass('active');
        }
        return false;
    });

    $(document).on('click touchend', '.fade', function (e) {
        $('.leftbar, .nav-resize, .fade, .rightbar, .action-leftbar, .action-rightbar, body').removeClass('active');
        return false;
    });

    $('.result-item .heading').on('click touchend', function () {
        if ($(this).parent().is('.active')) {
            $(this).parent().removeClass('active');
        } else {
            $('.result-item').removeClass('active');
            $(this).parent().addClass('active');
        }
        return false;
    });

    if (typeof this_line !== 'undefined') {
        var menuList = {}, menuListT = {};
        var gm = 0;
        getMenu();
        var timerMenu = setInterval(getMenu, 15000);
    }

    function getMenu() {
        if (gm) return false;
        gm = 1;
        var menu = $('.menu .scroll');
        var menuListN = {};
        var menuListTN = {};
        //var prevEl=menu.find('.desc[data-type="sport"]').eq(0);
        $.ajax({
            url: window.live_host + "/api/menus?live=" + live + '&lang=' + lang + '&tc=1',
            cache: true,
            dataType: 'json',
            complete: function () { gm = 0 },
            success: function (data) {
                console.log(data);
                $(".leftbar-pulse").remove();
                var prevEl = 0;
                $.each(data.games, function (key, value) {
                    if (live == 1 && typeof value.id === 'string' && $.inArray(value.id.toLowerCase(), ignore_bet_live_games_name) != -1) {
                        return true;
                    }
                    if (live != 1 && typeof value.id === 'string' && $.inArray(value.id.toLowerCase(), ignore_bet_line_games_name) != -1) {
                        return true;
                    }
                    var el = menu.find('.sport[data-id="' + value.id + '"]');
                    if (el.length) {
                        menuListN[value.id] = el;
                        el.find('.desc[data-type="sport"]').html(value.name + ' (' + value.count_games + ')');
                        prevEl = el;
                    }
                    else {
                        var icon = value.icon ? '<img src="' + window.pic_url + '/images/sport-icons/' + value.icon + '.' + value.ext + '" alt="' + value.name + '">' : '';

                        var el = $('<div class="item sport" data-id="' + value.id + '"><div class="ico"><div class="align">'
                         + icon + '</div></div><div class="desc" data-type="sport" data-id="' + value.id + '">' 
                         + value.name + ' (' + value.count_games + ')' + '</div>\
                            <div class="sublist"><div class="height"></div></div></div>');

                        if (prevEl == 0) {
                            menu.prepend(el);
                        }
                        else {
                            prevEl.after(el);
                        }
                        menuListN[value.id] = el;
                        prevEl = el;
                    }
                    var prevTour = 0;
                    $.each(data.tours[value.id], function (keyT, valueT) {
                        var t = el.find('.subitem[data-id=' + valueT.id + ']');
                        if (t.length) {
                            if (valueT.count_events == 0) {
                                t.remove();
                            }
                            else {
                                menuListTN[valueT.id] = t;
                                t.find('.desc').html(valueT.name + ' (' + valueT.count_events + ')');
                                prevTour = t;
                            }
                        }
                        else {
                            var icon = (valueT.icon != '' && valueT.icon != '.png') ? '<img src="' + window.pic_url + '/images/flags/' + valueT.icon + '">' : '<img src="' + window.pic_url + '/images/flags/kubok.png">';

                            var t = $('<a class="subitem" data-id="' + valueT.id + '" data-sport-id="' + value.id + '">\
                                    <div class="ico"><div class="align">'+ icon + '</div></div>\
                                    <div class="desc">'+ valueT.name + ' (' + valueT.count_events + ')</div>\
                                </a>');

                            if (prevTour == 0) {
                                el.find('.height').prepend(t);
                            }
                            else {
                                prevTour.after(t);
                            }
                            menuListTN[value.id] = t;
                            prevTour = t;
                        }
                    });
                    if (el.hasClass('active')) {
                        el.find('.sublist').height(el.find('.height').height());
                    }
                });
                for (var key in menuListT) {
                    if (typeof menuListTN[key] == 'undefined') {
                        menuListT[key].remove();
                    }
                }
                for (var key in menuList) {
                    if (typeof menuListN[key] == 'undefined') {
                        menuList[key].remove();
                    }
                }
                menuListT = Object.assign({}, menuListTN);
                menuList = Object.assign({}, menuListN);
                $('.leftbar .scroll:not(.second)').mCustomScrollbar("destroy");
                $('.leftbar .scroll:not(.second)').mCustomScrollbar({
                    axis: 'y',
                    autoHideScrollbar: true,
                    advanced: { autoExpandHorizontalScroll: true }
                });
            },
        });
    }


    if (window.location.hash == '#scrollToContainer') {
        if ($(window).width() < 1241) {
            $('html,body').animate({ scrollTop: $('.content .container').offset().top - 122 }, 500);
            if (window.history.pushState) {
                window.history.pushState('', '/', window.location.pathname)
            } else {
                window.location.hash = '';
            }
        }
    }


    //history-cash
    $(".see_comment").click(function (e) {
        e.preventDefault();
        $("#show-comment-value").text($(this).data("comment"));
        $('#show-comment-overlay').addClass('active');
        $('#show-comment-info').addClass('active');
    });
    //END history-cash


});

function initLeftBarScroll() {
    if ($('.leftbar .scroll:not(.second)').length) {
        $('.leftbar .scroll:not(.second)').mCustomScrollbar({
            axis: 'y',
            autoHideScrollbar: true,
            advanced: { autoExpandHorizontalScroll: true }
        });
    }
}

function initLeftBarScrollSecond() {
    if ($('.leftbar .scroll').length) {
        $('.leftbar .scroll:not(.second)').mCustomScrollbar({
            axis: 'y',
            autoHideScrollbar: true,
            advanced: { autoExpandHorizontalScroll: true }
        });
    }
}

function initRightBarScroll() {
    if ($('.rightbar .scroll').length) {
        $('.rightbar .scroll').mCustomScrollbar({
            axis: 'y',
            autoHideScrollbar: true,
            advanced: { autoExpandHorizontalScroll: true }
        });
    }
}

function initTelScroll() {

    $('.intl-tel-input .country-list').mCustomScrollbar({
        axis: 'y',
        autoHideScrollbar: true,
        advanced: { autoExpandHorizontalScroll: true },
        mouseWheel: { preventDefault: true }
    });

}


/*  Roulette */
(function ($) {
    var Roulette = function (options) {
        var defaultSettings = {
            maxPlayCount: null,
            speed: 10,
            stopImageNumber: null,
            rollCount: 3,
            duration: 3,
            stopCallback: function () { },
            startCallback: function () { },
            slowDownCallback: function () { }
        };
        var defaultProperty = {
            playCount: 0,
            $rouletteTarget: null,
            imageCount: null,
            $images: null,
            originalStopImageNumber: null,
            totalHeight: null,
            topPosition: 0,
            maxDistance: null,
            slowDownStartDistance: null,
            isRunUp: true,
            isSlowdown: false,
            isStop: false,
            distance: 0,
            runUpDistance: null,
            isIE: navigator.userAgent.toLowerCase().indexOf("msie") > -1
        };
        var p = $.extend({}, defaultSettings, options, defaultProperty);
        var reset = function () {
            p.maxDistance = defaultProperty.maxDistance;
            p.slowDownStartDistance = defaultProperty.slowDownStartDistance;
            p.distance = defaultProperty.distance;
            p.isRunUp = defaultProperty.isRunUp;
            p.isSlowdown = defaultProperty.isSlowdown;
            p.isStop = defaultProperty.isStop;
            p.topPosition = defaultProperty.topPosition
        };
        var slowDownSetup = function () {
            if (p.isSlowdown) {
                return
            }
            p.slowDownCallback();
            p.isSlowdown = true;
            p.slowDownStartDistance = p.distance;
            p.maxDistance = p.distance + 2 * p.totalHeight;
            p.maxDistance += p.imageHeight - p.topPosition % p.imageHeight;
            if (p.stopImageNumber != null) {
                p.maxDistance += (p.totalHeight - p.maxDistance % p.totalHeight + p.stopImageNumber * p.imageHeight) % p.totalHeight
            }
        };
        var roll = function () {
            var speed_ = p.speed;
            if (p.isRunUp) {
                if (p.distance <= p.runUpDistance) {
                    var rate_ = ~~(p.distance / p.runUpDistance * p.speed);
                    speed_ = rate_ + 1
                } else {
                    p.isRunUp = false
                }
            } else if (p.isSlowdown) {
                var rate_ = ~~((p.maxDistance - p.distance) / (p.maxDistance - p.slowDownStartDistance) * p.speed);
                speed_ = rate_ + 1
            }
            if (p.maxDistance && p.distance >= p.maxDistance) {
                p.isStop = true;
                reset();
                p.stopCallback(p.$rouletteTarget.find("img").eq(p.stopImageNumber));
                return
            }
            p.distance += speed_;
            p.topPosition += speed_;
            if (p.topPosition >= p.totalHeight) {
                p.topPosition = p.topPosition - p.totalHeight
            }
            if (p.isIE) {
                p.$rouletteTarget.css("top", "-" + p.topPosition + "px")
            } else {
                p.$rouletteTarget.css("transform", "translate(0px, -" + p.topPosition + "px)")
            }
            setTimeout(roll, 1)
        };
        var init = function ($roulette) {
            $roulette.css({
                overflow: "hidden"
            });
            defaultProperty.originalStopImageNumber = p.stopImageNumber;
            if (!p.$images) {
                p.$images = $roulette.find("img").remove();
                p.imageCount = p.$images.length;
                p.$images.eq(0).bind("load", function () {
                    p.imageHeight = $(this).height();
                    $roulette.css({
                        height: p.imageHeight + "px"
                    });
                    p.totalHeight = p.imageCount * p.imageHeight;
                    p.runUpDistance = 2 * p.imageHeight
                }).each(function () {
                    if (this.complete || this.complete === undefined) {
                        var src = this.src;
                        this.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
                        this.src = src
                    }
                })
            }
            $roulette.find("div").remove();
            p.$images.css({
                display: "block"
            });
            p.$rouletteTarget = $("<div>").css({
                position: "relative",
                top: "0"
            }).attr("class", "roulette-inner");
            $roulette.append(p.$rouletteTarget);
            p.$rouletteTarget.append(p.$images);
            p.$rouletteTarget.append(p.$images.eq(0).clone());
            $roulette.show()
        };
        var start = function () {
            p.playCount++;
            if (p.maxPlayCount && p.playCount > p.maxPlayCount) {
                return
            }
            p.stopImageNumber = $.isNumeric(defaultProperty.originalStopImageNumber) && Number(defaultProperty.originalStopImageNumber) >= 0 ? Number(defaultProperty.originalStopImageNumber) : Math.floor(Math.random() * p.imageCount);
            p.startCallback();
            roll();
            setTimeout(function () {
                slowDownSetup()
            }, p.duration * 1e3)
        };
        var stop = function (option) {
            if (!p.isSlowdown) {
                if (option) {
                    var stopImageNumber = Number(option.stopImageNumber);
                    if (0 <= stopImageNumber && stopImageNumber <= p.imageCount - 1) {
                        p.stopImageNumber = option.stopImageNumber
                    }
                }
                slowDownSetup()
            }
        };
        var option = function (options) {
            p = $.extend(p, options);
            p.speed = Number(p.speed);
            p.duration = Number(p.duration);
            p.duration = p.duration > 1 ? p.duration - 1 : 1;
            defaultProperty.originalStopImageNumber = options.stopImageNumber
        };
        var ret = {
            start: start,
            stop: stop,
            init: init,
            option: option
        };
        return ret
    };
    var pluginName = "roulette";
    $.fn[pluginName] = function (method, options) {
        return this.each(function () {
            var self = $(this);
            var roulette = self.data("plugin_" + pluginName);
            if (roulette) {
                if (roulette[method]) {
                    roulette[method](options)
                } else {
                    console && console.error("Method " + method + " does not exist on jQuery.roulette")
                }
            } else {
                roulette = new Roulette(method);
                roulette.init(self, method);
                $(this).data("plugin_" + pluginName, roulette)
            }
        })
    }
}
)(jQuery);

/* animateNumber */
(function (d) {
    var q = function (b) {
        return b.split("").reverse().join("")
    }
        , m = {
            numberStep: function (b, a) {
                var e = Math.floor(b);
                d(a.elem).text(e)
            }
        }
        , h = function (b) {
            var a = b.elem;
            a.nodeType && a.parentNode && (a = a._animateNumberSetter,
                a || (a = m.numberStep),
                a(b.now, b))
        };
    d.Tween && d.Tween.propHooks ? d.Tween.propHooks.number = {
        set: h
    } : d.fx.step.number = h;
    d.animateNumber = {
        numberStepFactories: {
            append: function (b) {
                return function (a, e) {
                    var g = Math.floor(a);
                    d(e.elem).prop("number", a).text(g + b)
                }
            },
            separator: function (b, a, e) {
                b = b || " ";
                a = a || 3;
                e = e || "";
                return function (g, k) {
                    var c = Math.floor(g).toString()
                        , t = d(k.elem);
                    if (c.length > a) {
                        for (var f = c, l = a, m = f.split("").reverse(), c = [], n, r, p, s = 0, h = Math.ceil(f.length / l); s < h; s++) {
                            n = "";
                            for (p = 0; p < l; p++) {
                                r = s * l + p;
                                if (r === f.length)
                                    break;
                                n += m[r]
                            }
                            c.push(n)
                        }
                        f = c.length - 1;
                        l = q(c[f]);
                        c[f] = q(parseInt(l, 10).toString());
                        c = c.join(b);
                        c = q(c)
                    }
                    t.prop("number", g).text(c + e)
                }
            }
        }
    };
    d.fn.animateNumber = function () {
        for (var b = arguments[0], a = d.extend({}, m, b), e = d(this), g = [a], k = 1, c = arguments.length; k < c; k++)
            g.push(arguments[k]);
        if (b.numberStep) {
            var h = this.each(function () {
                this._animateNumberSetter = b.numberStep
            })
                , f = a.complete;
            a.complete = function () {
                h.each(function () {
                    delete this._animateNumberSetter
                });
                f && f.apply(this, arguments)
            }
        }
        return e.animate.apply(e, g)
    }
}
)(jQuery);

function cleanWinAnimation() {
    $(".spin-won").fadeOut(300);
    $(".history-cases").fadeIn(300);
    $(".case-page-title").fadeIn(300);
}

function winAnimation(type) {

    window.win_sound = Math.round(Math.random() * 1);

    if (type == 2) {
        $(".spin-won h4").fadeIn(0);
    } else {
        $(".spin-won h4").fadeOut(0);
    }

    $("#audio-spin").animate({
        volume: 0.0
    }, 300, function () {
        $("#audio-spin").trigger('stop');
        $("#audio-win-" + window.win_sound).trigger('play');
        $("#audio-win-" + window.win_sound).animate({
            volume: 1.0
        }, 1000);
    });

    $(".spin-won").fadeIn(300);
    $(".history-cases").fadeOut(0);
    $(".case-page-title").fadeOut(0);
}

function maxbet(factor) {
    if (factor == 0) {
        return 0;
    }
    return (currency.limit / factor).toFixed(0);
}

var gc = 0, gl = 0, ge = 0;
function getCouponEvent() {
    if (gc) return false;
    gc = 1;
    var dataId = $("div.coupon .bet-item").map(function () {
        return $(this).data('id');
    }).get();
    var dataL = $("div.coupon .bet-item").map(function () {
        return $(this).data('live');
    }).get();
    var dataD = $("div.coupon .bet-item").map(function () {
        return $(this).data('d');
    }).get();
    var dataFactor = $("div.coupon .bet-item").map(function () {
        return $(this).data('curprice');
    }).get();
    var dataTeam = $("div.coupon .bet-item").map(function () {
        return $(this).data('pl');
    }).get();
    var dataPar = $("div.coupon .bet-item").map(function () {
        return $(this).data('lv');
    }).get();

    $.ajax({
        type: "POST",
        url: window.live_host + "/api/coupon_check",
        data: { "dataid": dataId, "dataD": dataD, "price": dataFactor, "dataTeam": dataTeam, "dataPar": dataPar, "dataL": dataL },
        cache: false,
        complete: function () { gc = 0 },
        success: function (data) {
            if (data.status == 0) return false;
            var coef = 1, c = 0;
            $.each(data.evt, function (t, ev) {
                var el = $('.bet-item[data-id="' + ev.id + '"]'), kef = el.find('.info .right');
                var kOld = el.data('price'), kNew = parseFloat(ev.k);
                if (ev.b) {
                    if (!el.hasClass('bet-item--locked'))
                        el.prepend('<p class="bet-item__locked-text">' + dictionary.blocked + '</p>');
                    el.addClass('bet-item--locked');
                    el.attr('data-b', 1);
                }
                else {
                    el.find('.bet-item__locked-text').remove();
                    el.removeClass('bet-item--locked');
                    el.attr('data-b', 0);
                    coef *= kNew;
                    c++;
                }

                kef.text(kNew);
                el.find('.sum-info .sum-item:eq(0)').text((dictionary.max_bet).replace('[]', sprintf(currency.short_format_sign, maxbet(kNew))));
                var s = el.find('input:eq(0)').val();
                el.find('.win .right').text(sprintf(currency.short_format_sign, parseFloat(s * kNew).toFixed(2)));
                el.attr('data-curprice', kNew);

                if (kOld == kNew) {
                    el.find('.info__coef-text').remove();
                    el.attr('data-change', 0);
                    kef.removeClass("up-coef").removeClass("dn-coef");
                }
                else {
                    el.attr('data-change', 1);
                    el.find('.info__coef-text').remove();
                    kef.after('<div class="info__coef-text">' + dictionary.coef_change + '</div>');
                }
                if (kNew > kOld) {
                    kef.addClass("up-coef");
                } else if (kNew < kOld) {
                    kef.addClass("dn-coef");
                }
            });

            $(".coupon .list div.coupon-info").remove();

            var price23 = $(".express.bet-item .sum input").val();

            $(".action-rightbar .count").text(c);
            $(".express.bet-item .sum .label b").text(parseFloat(coef).toFixed(2));
            $(".express.bet-item .win .c-green").text(sprintf(currency.short_format_sign, parseFloat(coef * price23).toFixed(2)));

        }
    });
}

function getEvent(eventId, colArr, live) {
    if (ge) return false;
    ge = 1;
    var newColArr = {};
    newColArr.groupData = new Array();
    newColArr.eventData = new Array();
    var l = 'line';
    if (window.live) {
        l = 'live';
    }
    $.ajax({
        url: window.live_host + '/api/eventa/' + l + '?eid=' + eventId + '&lang=' + window.lang + '&tc=1',
        cache: true,
        dataType: 'json',
        complete: function () { ge = 0 },
        success: function (data) {
            if (typeof data.error != 'undefined' || (typeof data.status != 'undefined' && data.status == 'error')) {
                var error = (typeof data.error != 'undefined' ? data.error : data.message);
                $('.bodyContainer').html('<div class="no-bets">' + error + '</div>');
                for (var key in colArr.groupData) {
                    colArr.groupData[key].remove();
                }
                window.colArr = {};
                window.colArr.groupData = {};
                window.colArr.eventData = {};
                $('.bets_container').remove();
                return false;
            }
            var events = data.results;
            data.results = null;

            var stats;
            if (typeof colArr.stats == 'undefined') {
                data.pic_url = window.pic_url;
                console.log(window.pic_url);
                data.userDate = userTimeConvert(data.timeStart);
                stats = $($.render.statsTemplate(data));
                $('.bodyContainer').html(stats);
            }
            else {
                stats = colArr.stats;
                stats.find('.num1').html(data.fullScore.K1);
                stats.find('.num2').html(data.fullScore.K2);
                stats.find('.periodName').html(data.periodName);
                stats.find('.fullTime').html('<div class="ico-timer"></div>' + data.fullTime);
                if (data.scores.length) {
                    var scores = '';

                    $.each(data.scores, function (t, score) {
                        scores += '<div class="sub-badges"><div class="sub-badge">' + score.Title + '</div><div class="sub-badge c-blue">' + score.K1 + ' – ' + score.K2 + '</div></div>';
                    });
                    $('.scores').html(scores);
                }
            }
            newColArr.stats = stats;

            var table1, table2;
            if (typeof colArr.table1 == 'undefined') {
                $('.bodyContainer').after('<div class="container bets_container"><table class="bet-table"><tr class="bet betmr" data-event="' + data.name + '"><td><div class="bet-col-group bet-col-group--cols-2"><ul class="more-bet more-bet--col" style="display: block"></ul><ul class="more-bet more-bet--col" style="display: block"></ul></td></tr></table></div>');
                table1 = $('.more-bet:eq(0)');
                table2 = $('.more-bet:eq(1)');
            }
            else {
                table1 = colArr.table1;
                table2 = colArr.table1;
            }

            newColArr.table1 = table1;
            newColArr.table2 = table2;

            var prevGroup1 = 0, prevGroup2 = 0;
            var gi = 0;
            $.each(events, function (t, groupData) {
                var group;
                if (typeof groupData.name !== 'undefined' && $.inArray(groupData.name, ['Tie-Break Or Extra Games In The Final Set', 'Tie-break o juegos extra en el set final', 'फाइनल सेट में टाई-ब्रेक या अतिरिक्‍त गेम्‍स', 'Sama Seri Atau Permainan Tambahan Dalam Set Akhir', 'Tie-break ou jogos extra no último set', 'Tie-break hoặc các trò chơi thêm trong hiệp cuối cùng']) != -1) {
                    return false;
                }
                //Tie-Break Or Extra Games In The Final Set
                if (typeof colArr.groupData[t] == 'undefined' || colArr.groupData[t].length == 0) {
                    group = $('<li class="exodus" style="font-size: 15px;"><div class="more-bet-title">' + groupData.name + ':</div><div class="exodus-group"></div></li>');
                    if (gi % 2 == 0) {
                        if (!prevGroup1) {
                            table1.append(group);
                        }
                        else
                            prevGroup1.after(group);

                        prevGroup1 = group;
                    }
                    else {
                        if (!prevGroup2) {
                            table2.append(group);
                        }
                        else
                            prevGroup2.after(group);

                        prevGroup2 = group;
                    }

                    for (var i = 0; i < groupData.countCols; i++) {
                        group.find('.exodus-group').append('<ul data-id="' + t + '_' + i + '"></ul>');
                    }
                }
                else {
                    group = colArr.groupData[t];
                }
                newColArr.groupData[t] = group;
                gi++;



                for (var i = 0; i < groupData.countCols; i++) {
                    var prevEvent = 0;
                    $.each(groupData.cols[i], function (et, eventData) {
                        var evId = t + '_' + i + '_' + et;
                        var event;
                        eventData.id = data.id;
                        eventData.name = eventData.title;
                        newColArr.eventData[evId] = new Array();
                        if (typeof colArr.eventData[evId] == 'undefined') {
                            event = $($.render.eventTemplate2(eventData));
                            if (!prevEvent)
                                group.find('ul[data-id=' + t + '_' + i + ']').append(event);
                            else
                                prevEvent.after(event);
                        }
                        else {
                            event = colArr.eventData[evId]['event'];

                            kOld = parseFloat(colArr.eventData[evId]['K']); kNew = parseFloat(eventData.K);
                            var factor = event.find('.factor');
                            factor.data('lv', eventData.lv).data('pl', eventData.pl).data('limit', eventData.limit).data('price', eventData.K).data('name', eventData.name).find('font').text(eventData.name);
                            event.find('.price').text(eventData.K);

                            if (kNew > kOld) {
                                factor.addClass("up-coef");
                                setTimeout(function () { factor.removeClass("up-coef", { duration: 10000 }); }, 2500);
                                // UP
                            } else if (kNew < kOld) {
                                factor.addClass("dn-coef");
                                setTimeout(function () { factor.removeClass("dn-coef", { duration: 10000 }); }, 2500);
                                // Down
                            }
                        }

                        if (eventData.bl == 1) {
                            event.find('.price').addClass('livegame__rate-item--error-event');
                        }
                        else {
                            event.find('.price').removeClass('livegame__rate-item--error-event');
                        }
                        prevEvent = newColArr.eventData[evId]['event'] = event;
                        newColArr.eventData[evId]['K'] = eventData.K;
                    });
                }
            });
            for (var key in colArr.eventData) {
                if (typeof newColArr.eventData[key] == 'undefined') {
                    colArr.eventData[key]['event'].remove();
                }
            }
            for (var key in colArr.groupData) {
                if (typeof newColArr.groupData[key] == 'undefined') {
                    colArr.groupData[key].remove();
                }
            }
            window.colArr = Object.assign({}, newColArr);


            if (l == 'live' && typeof data.SportId === 'number' && $.inArray(data.SportId, ignore_bet_live_event_id) != -1) {
                $('.bets_container').remove();
                return false;
            }
            if (l == 'line' && typeof data.SportId === 'number' && $.inArray(data.SportId, ignore_bet_line_event_id) != -1) {
                $('.bets_container').remove();
                return false;
            }
        }
    });

}
function getLine() {
    if (gl) return false;
    gl = 1;
    var gameArr = [], toursArr = [], eventsArr = [];
    l = 'line';
    if (window.live) {
        l = 'live';
    }
    if (!$(".bodyContainer .bets").is("div")) {
        $(".bodyContainer").html($("<div>", { class: 'bets' }));
        $('.bets_container').remove();
    }
    $.ajax({
        url: window.live_host + '/api/eventsa/' + l + '?sports=' + window.sportId + '&tournament=' + window.tourId + '&lang=' + window.lang + '&tc=1',
        cache: true,
        dataType: 'json',
        complete: function () { gl = 0 },
        success: function (data) {
            if (typeof data.error != 'undefined' && data.error != 1) {
                $('div.bets').html('<div class="no-bets">' + data.error + '</div>');
                window.gameArr = {}, window.toursArr = {}, window.eventsArr = {}, window.betsArr = {};
                window.emptyBet = 1;
                return false;
            }

            if (window.emptyBet) {
                $('div.bets').html('');
                window.emptyBet = 0;
            }
            var prevGame = 0;
            $.each(data, function (key, value) {
                if (live == 1 && typeof value.id === 'string' && $.inArray(value.id.toLowerCase(), ignore_bet_live_games_name) != -1) {
                    return true;
                }
                if (live != 1 && typeof value.id === 'string' && $.inArray(value.id.toLowerCase(), ignore_bet_line_games_name) != -1) {
                    return true;
                }
                var new_game = 0;
                gameArr[value.id] = 1;
                if (typeof window.gameArr[value.id] == 'undefined' || window.gameArr[value.id].length == 0) {
                    window.gameArr[value.id] = game = $($.render.gameTemplate(value));
                    new_game = 1;
                }
                else {
                    game = window.gameArr[value.id];
                }
                var prevTour = 0;
                $.each(value.tournaments, function (t, tourData) {
                    var new_tour = 0;
                    //tourData.pid=tourData.id+''+t;
                    toursArr[tourData.id] = 1;

                    if (typeof window.toursArr[tourData.id] == 'undefined' || toursArr[tourData.id].length == 0) {
                        window.toursArr[tourData.id] = tour = $($.render.tourTemplate(tourData));
                        new_tour = 1;
                    }
                    else {
                        tour = window.toursArr[tourData.id];
                    }

                    var prevEvent = 0;
                    var i = 0;
                    $.each(tourData.events, function (t, eventData) {
                        var ei = eventData.id;
                        eventData.header = tourData.header;
                        eventData.name = eventData.name1;
                        eventData.userTime = userTimeConvert(eventData.timeStart);
                        if (eventData.name2 != '') {
                            eventData.name += ' vs ' + eventData.name2;
                        }
                        i++;
                        var new_event = 0;
                        eventsArr[ei] = 1
                        if (typeof window.eventsArr[ei] == 'undefined' || window.eventsArr[ei].length == 0) {
                            eventData.id = encodeURIComponent(ei);
                            window.eventsArr[ei] = event = $($.render.eventTemplate(eventData));
                            new_event = 1;
                        }
                        else {
                            event = window.eventsArr[ei];
                        }
                        if (new_event) {
                            if (prevEvent === 0) {
                                tour.find('.livegame__body').append(event);
                                window.betsArr[ei] = new Array();
                                $.each(eventData.results, function (ki, k) {
                                    window.betsArr[ei][ki] = k;
                                });
                            }
                            else {
                                prevEvent.after(event);
                            }
                        }
                        else {
                            if (eventData.live) {
                                var scores = $($.render.scoresTemplate(eventData));
                                event.find('.livegame__col-line-box').html(scores);
                                event.find('.livegame__time-val').text(eventData.fullTime);
                                event.find('.livegame__time-extra').text(eventData.periodName);
                                if (eventData.i !== null)
                                    event.find('.livegame__info-extra-text').text(eventData.i);
                                else
                                    event.find('.livegame__info-extra-text').text('');
                            }

                            $.each(eventData.results, function (ki, k) {
                                if (typeof window.betsArr[ei] == 'undefined') window.betsArr[ei] = new Array();
                                if (typeof window.betsArr[ei][ki] == 'undefined') window.betsArr[ei][ki] = k;
                                kOld = window.betsArr[ei][ki].K;
                                if (k.a == 0) {
                                    var kef = event.find('.livegame__rate-item-coef[data-id=' + ki + ']');
                                }
                                else {
                                    var kef = event.find('.livegame__rate-item--coef[data-id=' + ki + ']');
                                    kef.parent().data('lv', k.lv).data('price', k.K);
                                }

                                if (kOld != k.K) {
                                    window.betsArr[ei][ki] = k;
                                    kef.text(k.K);
                                    kOld = parseFloat(kOld); kNew = parseFloat(k.K);
                                    if (kNew > kOld) {
                                        kef.addClass("up-coef");
                                        setTimeout(function () { kef.removeClass("up-coef", { duration: 10000 }); }, 2500);
                                        // UP
                                    } else if (kNew < kOld) {
                                        kef.addClass("dn-coef");
                                        setTimeout(function () { kef.removeClass("dn-coef", { duration: 10000 }); }, 2500);
                                        // Down
                                    }
                                }
                                if (k.bl == 1) {
                                    kef.addClass('livegame__rate-item--error');
                                }
                                else {
                                    kef.removeClass('livegame__rate-item--error');
                                }
                            });
                        }
                        prevEvent = event;
                    });
                    if (new_tour) {
                        if (prevTour === 0) {
                            game.find('.game-body').append(tour);
                        }
                        else {
                            prevTour.after(tour);
                        }
                    }
                    prevTour = tour;
                });
                if (new_game) {
                    if (prevGame === 0) {
                        $('div.bets').prepend(game);
                    }
                    else {
                        prevGame.after(game);
                    }
                }
                prevGame = game;
            });

            for (var key in window.eventsArr) {
                if (typeof eventsArr[key] == 'undefined') {
                    window.eventsArr[key].remove();
                    delete window.eventsArr[key];
                }
            }
            for (var key in window.toursArr) {
                if (typeof toursArr[key] == 'undefined') {
                    window.toursArr[key].remove();
                    delete window.toursArr[key];
                }
            }
            for (var key in window.gameArr) {
                if (typeof gameArr[key] == 'undefined') {
                    window.gameArr[key].remove();
                    delete window.gameArr[key];
                }
            }

        },
    });
}


var roundOptions = new Array;
var rouletteObject = new Array;

function spinbox(gameId, button, count) {
    var gameButton = $(button);
    var gamePrice = parseFloat($("#spin-amount").text());
    var gameButtonText = $(button).html();
    var gameLoader = $("#game-" + gameId + " .loading");
    var otherButtons = $(".three .btn");
    var gameChance = window.spin_chance;

    gameButton.text(dictionary.open_case);
    gameButton.attr("disabled", "disabled");

    $.ajax({
        url: '/ajax/case.php',
        data: {
            gameId: gameId
        }
    }).done(function (response) {
        var resultData = $.parseJSON(response);

        var showResult = resultData.data;

        if (resultData.status == 1) {

            var giftImg = 0;
            $.each($('.roulette img'), function () {
                var g = parseInt($(this).attr("id").split('gift-id-')[1]);
                giftImg++;
                if (g == showResult['gift']) {
                    showResult.result = giftImg - 1;

                }
            });

            roundOptions[gameId] = {
                speed: 24,
                duration: 1,
                stopImageNumber: showResult.result,
                startCallback: function () {

                },
                stopCallback: function () {

                    var startNewGame = setTimeout(function () {

                        gameButton.html(gameButtonText);
                        gameButton.removeAttr("disabled");

                        /* win info */
                        $("#spin-win-name").html(showResult['text']);
                        $("#spin-win-icon").attr("src", showResult['photo']);

                        winAnimation(showResult['type']);

                    }, 1000);
                }
            }

            if (rouletteObject[gameId] == undefined || rouletteObject[gameId] == 'undefined') {
                rouletteObject[gameId] = $(".roulette").roulette(roundOptions[gameId]);
            } else {
                rouletteObject[gameId].roulette('option', roundOptions[gameId]);
            }
            rouletteObject[gameId].roulette('start');

            if (resultData.data && resultData.data.balance) {
                setTimeout(function () {
                    $('.balances .item .desc.c-green').html(resultData.data.balance)
                }, 7000)
            }
        } else {
            showPopup("#error");
            if (resultData.error) {
                $('#error_text').html(resultData.error);
            }
            gameButton.html(gameButtonText);
            gameButton.removeAttr("disabled");
        }
    }).fail(function () {
        showPopup("#error");
    });
}

function initFiltersScroll() {

    if ($('.js-filtersScroll').length) {

        $('.js-filtersScroll').mCustomScrollbar({
            axis: 'x',

        });

    }

}
initFiltersScroll();

//Показать\скрыть помощь на страницах выплаты\депозита
$(document).on('click', '.payments-help-btn', function (e) {
    $('.payments-help').toggleClass('active');
});

$(document).on('click', '.js-livegameBetsShow', function (e) {
    var bets = $(this).closest('.livegame__body-box').find('.livegame__body-bets');

    if (bets.length) {
        bets.slideToggle(500);
        $(this).toggleClass('livegame__btn--active');
    }
});

$(document).on('click', '.js-livegameBetsShow', function (e) {
    var bets = $(this).closest('.livegame__body-box').find('.livegame__body-bets');

    if (bets.length) {
        bets.slideToggle(500);
        $(this).toggleClass('livegame__btn--active');
    }
});

$(document).on('click', '.js-filtersList .filters__item-link', function (e) {
    $(this).parent('.js-filtersList').find('.filters__item-link').removeClass('filters__item-link--active');
    $(this).addClass('filters__item-link--active');
});

function formatIds(item) {
    if (!item.name) return null;
    var flag1 = item.c1 ? '<img src="images/flags/' + item.c1 + '.png" class="result-find__img">' : '';
    var flag2 = item.c2 ? '<img src="images/flags/' + item.c2 + '.png" class="result-find__img result-find__img--ml">' : '';
    var flagt = item.country ? '<img src="images/flags/' + item.country + '.png" class="result-find__img result-find__img--ml">' : '';
    var live = item.live ? 'LIVE' : '';
    var game = item.game ? item.game + '. ' : '';
    var c = item.count ? '<span style="color:#39b91a">' + item.count + ' ' + declOfNum(item.count, [dictionary.event, dictionary.event_2, dictionary.event_3]) + '</span>' : '';
    var eventTime = item.eventTime ? item.eventTime : '';
    var periodName = item.periodName != null ? item.periodName + ' ' : '';
    var timeName = userTimeConvert(item.timeStart) + (item.live ? ' (' + periodName + eventTime + ')' : '');
    var item_text = '<p class="result-find__item"><span style="color:#5d9cec">' + timeName + '</span><span class="result-find__up-text">' + live + '</span></p><p class="result-find__item">' + game + '<span class="result-find__up-text">' + item.tour + flagt + '</span></p><p class="result-find__item">' + flag1 + item.name + flag2 + '</p><p class="result-find__item">' + c + '</p>';
    return item_text;
}

function declOfNum(number, titles) {
    cases = [2, 0, 1, 1, 1, 2];
    return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
}

function sprintf() {    // Return a formatted string
    // 
    // +   original by: Ash Searle (http://hexmen.com/blog/)
    // + namespaced by: Michael White (http://crestidg.com)

    var regex = /%%|%(\d+\$)?([-+#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuidfegEG])/g;
    var a = arguments, i = 0, format = a[i++];

    // pad()
    var pad = function (str, len, chr, leftJustify) {
        var padding = (str.length >= len) ? '' : Array(1 + len - str.length >>> 0).join(chr);
        return leftJustify ? str + padding : padding + str;
    };

    // justify()
    var justify = function (value, prefix, leftJustify, minWidth, zeroPad) {
        var diff = minWidth - value.length;
        if (diff > 0) {
            if (leftJustify || !zeroPad) {
                value = pad(value, minWidth, ' ', leftJustify);
            } else {
                value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
            }
        }
        return value;
    };

    // formatBaseX()
    var formatBaseX = function (value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
        // Note: casts negative numbers to positive ones
        var number = value >>> 0;
        prefix = prefix && number && { '2': '0b', '8': '0', '16': '0x' }[base] || '';
        value = prefix + pad(number.toString(base), precision || 0, '0', false);
        return justify(value, prefix, leftJustify, minWidth, zeroPad);
    };

    // formatString()
    var formatString = function (value, leftJustify, minWidth, precision, zeroPad) {
        if (precision != null) {
            value = value.slice(0, precision);
        }
        return justify(value, '', leftJustify, minWidth, zeroPad);
    };

    // finalFormat()
    var doFormat = function (substring, valueIndex, flags, minWidth, _, precision, type) {
        if (substring == '%%') return '%';

        // parse flags
        var leftJustify = false, positivePrefix = '', zeroPad = false, prefixBaseX = false;
        for (var j = 0; flags && j < flags.length; j++) switch (flags.charAt(j)) {
            case ' ': positivePrefix = ' '; break;
            case '+': positivePrefix = '+'; break;
            case '-': leftJustify = true; break;
            case '0': zeroPad = true; break;
            case '#': prefixBaseX = true; break;
        }

        // parameters may be null, undefined, empty-string or real valued
        // we want to ignore null, undefined and empty-string values
        if (!minWidth) {
            minWidth = 0;
        } else if (minWidth == '*') {
            minWidth = +a[i++];
        } else if (minWidth.charAt(0) == '*') {
            minWidth = +a[minWidth.slice(1, -1)];
        } else {
            minWidth = +minWidth;
        }

        // Note: undocumented perl feature:
        if (minWidth < 0) {
            minWidth = -minWidth;
            leftJustify = true;
        }

        if (!isFinite(minWidth)) {
            throw new Error('sprintf: (minimum-)width must be finite');
        }

        if (!precision) {
            precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type == 'd') ? 0 : void (0);
        } else if (precision == '*') {
            precision = +a[i++];
        } else if (precision.charAt(0) == '*') {
            precision = +a[precision.slice(1, -1)];
        } else {
            precision = +precision;
        }

        // grab value using valueIndex if required?
        var value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];

        switch (type) {
            case 's': return formatString(String(value), leftJustify, minWidth, precision, zeroPad);
            case 'c': return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
            case 'b': return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'o': return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'x': return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'X': return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase();
            case 'u': return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'i':
            case 'd': {
                var number = parseInt(+value);
                var prefix = number < 0 ? '-' : positivePrefix;
                value = prefix + pad(String(Math.abs(number)), precision, '0', false);
                return justify(value, prefix, leftJustify, minWidth, zeroPad);
            }
            case 'e':
            case 'E':
            case 'f':
            case 'F':
            case 'g':
            case 'G':
                {
                    var number = +value;
                    var prefix = number < 0 ? '-' : positivePrefix;
                    var method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
                    var textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
                    value = prefix + Math.abs(number)[method](precision);
                    return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
                }
            default: return substring;
        }
    };

    return format.replace(regex, doFormat);
}


function userTimeConvert(timestring) {
    var data = new Date(timestring.replace(' ', 'T') + '+00:00');
    if (isNaN(data)) {
        data = timestring;
    }
    else {
        data = (data.getFullYear() + '-' + ('0' + (data.getMonth() + 1)).slice(-2) + '-' + ('0' + data.getDate()).slice(-2) + ' ' + ('0' + data.getHours()).slice(-2) + ':' + ('0' + data.getMinutes()).slice(-2) + ':' + ('0' + data.getSeconds()).slice(-2));
    }
    return data;
}

