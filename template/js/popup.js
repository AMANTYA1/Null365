// show popup
function showPopup(el) {
    if($('.popup').is('.active')) {
        $('.popup').removeClass('active');
    }
    if($(document).height() > $(window).height() && navigator.platform.indexOf('Mac') === -1) {
        $('body').addClass('active');
    }
    $('.overlay, .popup'+el).addClass('active');

    document.body.style.overflow = 'hidden'; 
    document.body.style.height = '100%'; 
    document.body.style.width = '100%'; 
    if (osIsiOS ()) { 
        document.body.style.position = 'fixed'; 
    }
}

// hide popup
function closePopup() {
    $('body, .overlay, .popup, .fade').removeClass('active');
    
    document.body.style.overflow = ''; 
    document.body.style.height = ''; 
    document.body.style.width = ''; 
    if (osIsiOS ()) { 
        document.body.style.position = ''; 
    }
}

function osIsiOS() {

  var iDevices = [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ];

  if (!!navigator.platform) {
    while (iDevices.length) {
      if (navigator.platform === iDevices.pop()){ return true; }
    }
  }

  return false;
}

$(document).ready(function(){
	// tabs
	$('.tabs .tab').on('click',function(){
        if(!$(this).is('.active')) {
            $('.tabs .tab[data-type="'+$(this).attr('data-type')+'"], .tab-content[data-type="'+$(this).attr('data-type')+'"]').removeClass('active');
            $(this).addClass('active');
            $('.tab-content[data-type="'+$(this).attr('data-type')+'"]'+$(this).attr('href')).addClass('active');
        }
        return false;
    });
	
    $(document).on('click','[rel=popup]', function() {
        showPopup($(this).attr('href'));
        return false;
    });

    $('[rel=close]').click(function(){
        closePopup();
    });

    $('.overlay').click(function(e) {
        var target = e.srcElement || e.target;
        if(!target.className.search('overlay')) {
            closePopup();
        }
    });
	
})