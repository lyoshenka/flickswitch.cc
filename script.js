jQuery(function ($) {
  $.fn.tallest = function () {
    return this._extremities({'aspect': 'height', 'max': true})[0]
  };
  $.fn.tallestSize = function () {
    return this._extremities({'aspect': 'height', 'max': true})[1]
  };
  $.fn.shortest = function () {
    return this._extremities({'aspect': 'height', 'max': false})[0]
  };
  $.fn.shortestSize = function () {
    return this._extremities({'aspect': 'height', 'max': false})[1]
  };
  $.fn.widest = function () {
    return this._extremities({'aspect': 'width', 'max': true})[0]
  };
  $.fn.widestSize = function () {
    return this._extremities({'aspect': 'width', 'max': true})[1]
  };
  $.fn.thinnest = function () {
    return this._extremities({'aspect': 'width', 'max': false})[0]
  };
  $.fn.thinnestSize = function () {
    return this._extremities({'aspect': 'width', 'max': false})[1]
  };
  $.fn._extremities = function (options) {
    var defaults = {aspect: 'height', max: true};
    options = $.extend(defaults, options);
    if (this.length < 2)
    {
      return [this, this[options.aspect]()];
    }
    var bestIndex = 0, bestSize = this.eq(0)[options.aspect](), thisSize;
    for (var i = 1; i < this.length; ++i)
    {
      thisSize = this.eq(i)[options.aspect]();
      if ((options.max && thisSize > bestSize) || (!options.max && thisSize < bestSize))
      {
        bestSize = thisSize;
        bestIndex = i;
      }
    }
    return [this.eq(bestIndex), bestSize];
  };
  $.fn.animateHighlight = function (highlightColor, duration) {
    var highlightBg = highlightColor || "#FFFF9C", animateMs = duration || 2500, originalBg = this.css('backgroundColor');
    this.css('background-color', highlightBg).animate({backgroundColor: originalBg}, animateMs);
  };
  $.fn.customFadeIn = function (speed, callback) {
    $(this).fadeIn(speed, function () {
      if (!$.support.opacity)
      {
        var el = $(this).get(0);
      }
      if (el && el.style)
      {
        el.style.removeAttribute('filter');
      }
      if (callback != undefined)
      {
        callback();
      }
    });
  };
  $.fn.customFadeOut = function (speed, callback) {
    $(this).fadeOut(speed, function () {
      if (!$.support.opacity)
      {
        var el = $(this).get(0);
      }
      if (el && el.style)
      {
        el.style.removeAttribute('filter');
      }
      if (callback != undefined)
      {
        callback();
      }
    });
  };
});
function fsConstructor() {
  this.fixSpotlightHeights = function () {
    $.each(['.a-slot.spotlight'], function (index, selector) {
      var processed = {}, items = $(selector);
      items.height('auto');
      items.each(function () {
        var item = $(this), area = item.closest('.a-area');
        if (area.length && !processed[area.eq(0).attr('id')])
        {
          var children = area.find(selector);
          children.height(children.tallestSize());
          processed[area.id] = true;
        }
      });
    });
  }
  this.createServicesPuzzle = function () {
    var services = $('#services-puzzle'), positions = {1: 'first', 2: 'second', 3: 'third', 4: 'fourth'};

    function refreshPositions() {
      var pos = 1;
      services.find('.puzzle-piece').each(function () {
        var item = $(this);
        item.removeClass('cur-first cur-second cur-third cur-fourth');
        if (item.css('position') == 'absolute')
        {
          return;
        }
        item.addClass('cur-' + positions[pos]);
        pos++;
      });
    }

    services.sortable({
      items: '.puzzle-piece',
      placeholder: "puzzle-piece placeholder",
      start: refreshPositions,
      stop: refreshPositions,
      change: refreshPositions,
      tolerance: 'pointer',
      containment: services.find('.pieces'),
      update: function (event, ui) {
        refreshPositions();
        var color;
        services.find('.puzzle-piece').each(function (index) {
          var element = $(this);
          if (element.hasClass(positions[index + 1]))
          {
            element.removeClass('incorrect');
            if (this == ui.item[0])
            {
              color = '#e6efc2';
            }
          }
          else
          {
            element.addClass('incorrect');
            if (this == ui.item[0])
            {
              color = '#fbe3e4';
            }
          }
        });
        if (services.find('.incorrect').length == 0)
        {
          services.trigger('solved');
        }
        else
        {
          $(ui.item[0]).animateHighlight(color);
        }
        if (window.pageTracker)
        {
          pageTracker._trackPageview("/puzzle/moved");
        }
      }
    });
    services.bind('solved', function () {
      var solvedMessage = services.find('.solved-message'), images = services.find('.puzzle-piece .switch'), contents = services.find('.puzzle-piece-content');
      services.sortable('disable');
      services.addClass('solved');
      contents.hide();
      solvedMessage.css({'visibility': 'visible'});
      images.animate({opacity: .75}, 2500);
      setTimeout(function () {
        contents.customFadeIn(2000);
        images.animate({opacity: .08}, 2000);
      }, 3000);
      services.find('.pieces css3-container').hide();
      services.find('a.reset').click(function () {
        services.removeClass('solved');
        solvedMessage.css({'visibility': 'hidden'});
        services.sortable('enable');
        services.find('.puzzle-piece.second').insertBefore(services.find('.puzzle-piece.first'));
        services.find('.puzzle-piece.third').insertAfter(services.find('.puzzle-piece.fourth'));
        services.find('.pieces css3-container').show();
        refreshPositions();
      });
      if (window.pageTracker)
      {
        pageTracker._trackPageview("/puzzle/solved");
      }
    });
    services.disableSelection();
  }


  this.observeFeedbackForms = function () {
    $('.wf-feedback-form').each(function () {
      var form = $(this);
      form.ajaxForm({
                      dataType: 'json', beforeSubmit: function () {
          form.find('.a-btn.a-submit').removeClass('a-email').addClass('a-busy');
        }, success: function (json) {
          if (json.success)
          {
            form.find('.a-btn.a-submit').addClass('a-email').removeClass('a-busy');
            $('#feedback-sent').show();
          }
          else
          {
            form.ajaxFormUnbind();
            form.submit();
          }
        }, error: function () {
          alert('Issue with submission. Please email team@flickswitch.cc with your message.');
        }
                    });
    });
  }


  this.observeSlides = function (selector) {
    var container = $(selector),
        buttons = container.find('.pager .a-btn');
    buttons.click(function () {
      var button = $(this), slide = button.data('slide');
      buttons.removeClass('active');
      button.addClass('active');
      container.find('.slide').hide();
      container.find('.slide-' + slide).show();
    })
  }
}

window.fs = new fsConstructor();

$(function () {
  fs.createServicesPuzzle();
  fs.observeFeedbackForms();
  fs.fixSpotlightHeights();
});
