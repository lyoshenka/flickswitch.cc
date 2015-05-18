function aConstructor()
{
  var debug = false;
  this.onSubmitHandlers = new Object();
  this.registerOnSubmit = function (slotId, callback)
  {
    if (!this.onSubmitHandlers[slotId])
    {
      this.onSubmitHandlers[slotId] = [callback];
      return;
    }
    this.onSubmitHandlers[slotId].push(callback);
  };
  this.callOnSubmit = function (slotId)
  {
    var handlers = this.onSubmitHandlers[slotId];
    if (handlers)
    {
      var i;
      for (i = 0; (i < handlers.length); i++)
      {
        handlers[i](slotId);
      }
    }
    $('.a-needs-update').trigger('a.update');
  }
  this.setMessages = function (messages)
  {
    this.messages = messages;
  }
  this.ready = function (options)
  {
    if (typeof(apostropheReady) == "function")
    {
      apostropheReady();
    }
    if (typeof(aOverrides) == "function")
    {
      aOverrides();
    }
  }
  this.swapNodes = function (a, b)
  {
    var t = a.parentNode.insertBefore(document.createTextNode(''), a);
    b.parentNode.insertBefore(a, b);
    t.parentNode.insertBefore(b, t);
    t.parentNode.removeChild(t);
  }
  this.log = function (output)
  {
    if (window.console && console.log && debug === true)
    {
      console.log(output);
    }
    ;
  }
  this.setDebug = function (flag)
  {
    debug = flag;
  };
  this.getDebug = function ()
  {
    return debug;
  };
  this.setObjectId = function (domId, objectId)
  {
    $('#' + domId).data('id', objectId);
  }
  this.selectOnFocus = function (selector)
  {
    $(selector).focus(function ()
                      {
                        $(this).select();
                      }).mouseup(function (e)
                                 {
                                   e.preventDefault();
                                 });
  }
  this.selfLabel = function (options)
  {
    aInputSelfLabel(options['selector'], options['title'], options['select'], options['focus'], options['persistentLabel']);
  };
  this.clickOnce = function (selector)
  {
    var selector = $(selector);
    selector.unbind('click.aClickOnce').bind('click.aClickOnce', function ()
    {
      apostrophe.toSpan(selector);
    });
  }
  this.toSpan = function (selector)
  {
    $(selector).each(function ()
                     {
                       var id = "";
                       var clss = "";
                       if ($(this).attr('id') != '')
                       {
                         id = "id='" + $(this).attr('id') + "'";
                       }
                       ;
                       if ($(this).attr('class') != '')
                       {
                         clss = "class='" + $(this).attr('class') + "'";
                       }
                       ;
                       $(this).replaceWith("<span " + clss + " " + id + ">" + $(this).html() + "</span>");
                     });
  }
  this.linkToRemote = function (options)
  {
    var link = $(options['link']);
    var update = $(options['update']);
    var method = (options['method']) ? options['method'] : 'GET';
    var remote_url = options['url'];
    var eventType = (options['event']) ? options['event'] : 'click';
    var restore = (options['restore']) ? options['restore'] : false;
    if (link.length)
    {
      link.bind(eventType, function ()
      {
        $.ajax({
                 type: method, dataType: 'html', beforeSend: function ()
          {
            update.addClass('a-remote-data-loading');
          }, success: function (data, textStatus)
          {
            if (restore)
            {
              update.data('aBeforeUpdate', update.children().clone(true));
            }
            ;
            update.html(data);
          }, complete: function ()
          {
            if (restore)
            {
              update.find('.a-cancel').unbind('click.aRestore').bind('click.aRestore', function (event)
              {
                event.preventDefault();
                update.html(update.data('aBeforeUpdate'));
              });
            }
            ;
            update.removeClass('a-remote-data-loading');
          }, url: remote_url
               });
        return false;
      });
    }
    else
    {
      apostrophe.log('apostrophe.linkToRemote -- No Link Found');
    }
    ;
    if (!update.length)
    {
      apostrophe.log('apostrophe.linkToRemote -- No Update Target Found');
    }
    ;
  }
  this.unobfuscateEmail = function (aClass, email, label)
  {
    $('.' + aClass).attr('href', unescape(email)).html(unescape(label));
  }
  this.formUpdates = function (options)
  {
    var form = $(options['selector']);
    form.unbind('submit.aFormUpdates');
    form.bind('submit.aFormUpdates', function ()
    {
      $('.a-needs-update').trigger('a.update');
      var updating = $('#' + options['update']);
      apostrophe.updating(updating);
      var action = form.attr('action');
      $.post(action, form.serialize(), function (data)
      {
        updating.trigger('aUpdated');
        updating.html(data);
      });
      return false;
    });
  }
  this.updating = function (selector)
  {
    var updating = $(selector);
    var submit = updating.find('.a-show-busy');
    if (!submit.data('busy'))
    {
      submit.data('busy', 1).addClass('a-busy');
      if (!submit.hasClass('icon'))
      {
        submit.addClass('icon').prepend('<span class="icon"></span>');
      }
    }
    ;
  }
  this.radioToggleButton = function (options)
  {
    apostrophe.log('apostrophe.radioToggleButton');
    var opt1Label = (options['opt1Label']) ? options['opt1Label'] : 'on';
    var opt2Label = (options['opt2Label']) ? options['opt2Label'] : 'off';
    var field = $(options['field']);
    var radios = field.find('input[type="radio"]');
    radios.length ? '' : apostrophe.log('apostrophe.radioToggleButton -- selector: ' + options['field'] + ' -- No radio inputs found');
    if (field.length)
    {
      options['debug'] ? apostrophe.log('apostrophe.radioToggleButton --' + field + '-- debugging') : field.find('.radio_list').hide();
      if (!field.find('.a-toggle-btn').length)
      {
        var toggleButton = $('<a/>');
        toggleButton.addClass('a-btn icon lite a-toggle-btn');
        toggleButton.html('<span class="icon"></span><span class="option-1">' + opt1Label + '</span><span class="option-2">' + opt2Label + '</span>');
        field.prepend(toggleButton);
        var btn = field.find('.a-toggle-btn');
        updateToggle(btn);
        btn.click(function ()
                  {
                    toggle(btn);
                  });
      }
      ;
    }
    else
    {
      field.length ? '' : apostrophe.log('apostrophe.radioToggleButton -- No field found');
    }
    ;
    function toggle(button)
    {
      if ($(radios[0]).is(':checked'))
      {
        $(radios[0]).attr('checked', null);
        $(radios[1]).attr('checked', 'checked');
      }
      else
      {
        $(radios[1]).attr('checked', null);
        $(radios[0]).attr('checked', 'checked');
      }
      ;
      updateToggle(button);
    };
    function updateToggle(button)
    {
      if ($(radios[0]).is(':checked'))
      {
        button.addClass('option-1').removeClass('option-2');
      }
      else
      {
        button.addClass('option-2').removeClass('option-1');
      }
      ;
    }
  }
  this.IE6 = function (options)
  {
    var authenticated = options['authenticated'];
    var message = options['message'];
    if (authenticated)
    {
      $(document.body).addClass('ie6').prepend('<div id="ie6-warning"><h2>' + message + '</h2></div>');
    }
  }
  this.jsTree = function (options)
  {
    var treeData = options['treeData'];
    var moveURL = options['moveUrl'];
    var aPageTree = $('#a-page-tree');
    aPageTree.tree({
                     data: {type: 'json', json: [treeData]},
                     ui: {theme_path: "/apostrophePlugin/js/jsTree/source/themes/", theme_name: "punk", context: false},
                     rules: {renameable: false, deletable: 'all', creatable: false, draggable: 'all', dragrules: 'all'},
                     callback: {
                       onmove: function (node, refNode, type, treeObj, rb)
                       {
                         aPageTree.parent().addClass('working');
                         var nid = node.id;
                         var rid = refNode.id;
                         jQuery.ajax({
                                       url: options['moveURL'] + "?" + "id=" + nid.substr("tree-".length) + "&refId=" + rid.substr("tree-".length) + "&type=" + type,
                                       error: function (result)
                                       {
                                       },
                                       success: function (result)
                                       {
                                         if (result !== 'ok')
                                         {
                                         }
                                         aPageTree.parent().removeClass('working');
                                       },
                                       async: false
                                     });
                       }, ondelete: function (node, treeObj, rb)
                       {
                         aPageTree.parent().addClass('working');
                         var nid = node.id;
                         jQuery.ajax({
                                       url: options['deleteURL'] + "?" + "id=" + nid.substr("tree-".length), error: function (result)
                           {
                           }, success: function (result)
                           {
                             if (result !== 'ok')
                             {
                             }
                             aPageTree.parent().removeClass('working');
                           }, async: false
                                     });
                       }
                     }
                   });
    treeRef = $.tree_reference(aPageTree.attr('id'));
    aPageTree.find('.a-tree-delete-btn').click(function ()
                                               {
                                                 var li = $(this).closest('li');
                                                 if (li.find('li').length)
                                                 {
                                                   if (!confirm(options['confirmDeleteWithChildren']))
                                                   {
                                                     return false;
                                                   }
                                                 }
                                                 else
                                                 {
                                                   if (!confirm(options['confirmDeleteWithoutChildren']))
                                                   {
                                                     return false;
                                                   }
                                                 }
                                                 treeRef.remove(li);
                                                 return false;
                                               });
  }
  this.slideshowSlot = function (options)
  {
    var debug = options['debug'];
    var transition = options['transition'];
    var id = options['id'];
    var intervalEnabled = !!options['interval'];
    var intervalSetting = options['interval'];
    var positionFlag = options['position'];
    var position = (options['startingPosition']) ? options['startingPosition'] : 0;
    var duration = (options['duration']) ? options['duration'] : 300;
    var slideshowSelector = (options['slideshowSelector']) ? options['slideshowSelector'] : '#a-slideshow-' + id;
    var slideshow = $(slideshowSelector);
    var slideshowControlsSelector = (options['controls']) ? options['controls'] : '.a-slideshow-controls';
    var slideshowControls = slideshow.next(slideshowControlsSelector);
    var slideshowItemsSelector = (options['slideshowItemsSelector']) ? options['slideshowItemsSelector'] : '.a-slideshow-item';
    var slideshowItems = slideshow.find(slideshowItemsSelector);
    var itemCount = slideshowItems.length;
    var positionSelector = (options['positionSelector']) ? options['positionSelector'] : '.a-slideshow-position-head';
    var positionHead = slideshowControls.find(positionSelector);
    var intervalTimeout = null;
    var currentItem;
    var newItem;
    var oldItem;
    (options['title']) ? slideshowItems.attr('title', options['title']) : slideshowItems.attr('title', '');
    (debug) ? apostrophe.log('apostrophe.slideshowSlot --' + id + '-- Debugging') : '';
    (debug) ? apostrophe.log('apostrophe.slideshowSlot --' + id + '-- Item Count : ' + itemCount) : '';
    if (itemCount === 1)
    {
      slideshow.addClass('single-image');
      $(slideshowItems[0]).show();
      (debug) ? apostrophe.log('apostrophe.slideshowSlot --' + id + '-- Single Image') : '';
    }
    else
    {
      if (window.aSlideshowIntervalTimeouts !== undefined)
      {
        if (window.aSlideshowIntervalTimeouts['a-' + id])
        {
          clearTimeout(window.aSlideshowIntervalTimeouts['a-' + id]);
        }
      }
      else
      {
        window.aSlideshowIntervalTimeouts = {};
      }
      function init()
      {
        (debug) ? apostrophe.log(slideshowItems) : '';
        slideshowItems.hide();
        $(slideshowItems[position]).show();
        setPosition(position);
        interval();
      }

      function previous()
      {
        currentItem = position;
        (position == 0) ? position = itemCount - 1 : position--;
        showItem(position, currentItem);
        (debug) ? apostrophe.log('apostrophe.slideshowSlot --' + id + '-- Previous : ' + currentItem + ' / ' + position) : '';
      };
      function next()
      {
        currentItem = position;
        (position == itemCount - 1) ? position = 0 : position++;
        showItem(position, currentItem);
        (debug) ? apostrophe.log('apostrophe.slideshowSlot --' + id + '-- Next : ' + currentItem + ' / ' + position) : '';
      };
      function showItem(position, currentItem)
      {
        if (!slideshow.data('showItem'))
        {
          slideshow.data('showItem', 1);
          newItem = $(slideshowItems[position]);
          oldItem = (currentItem) ? $(slideshowItems[currentItem]) : slideshowItems;
          if (transition == 'crossfade')
          {
            oldItem.fadeOut(duration);
          }
          else
          {
            newItemHeight = newItem.height() + 'px';
            slideshow.css('height', newItemHeight);
            slideshowItems.hide();
          }
          ;
          newItem.fadeIn(duration, function ()
          {
            slideshow.data('showItem', 0);
            setPosition(position);
            interval();
          });
        }
        ;
      };
      function setPosition(p)
      {
        slideshow.data('position', p);
        (debug) ? apostrophe.log('apostrophe.slideshowSlot --' + id + '-- positionFlag : ' + positionFlag) : '';
        (debug) ? apostrophe.log('apostrophe.slideshowSlot --' + id + '-- setPosition : ' + (p + 1)) : '';
        if (positionFlag && positionHead.length)
        {
          positionHead.text(parseInt(p) + 1);
          (debug) ? apostrophe.log('apostrophe.slideshowSlot --' + id + '-- setPosition : ' + p + 1) : '';
        }
        ;
      };
      function interval()
      {
        if (intervalTimeout)
        {
          clearTimeout(intervalTimeout);
        }
        ;
        if (intervalEnabled)
        {
          intervalTimeout = setTimeout(next, intervalSetting * 1000);
          window.aSlideshowIntervalTimeouts['a-' + id] = intervalTimeout;
          (debug) ? apostrophe.log('apostrophe.slideshowSlot --' + id + '-- Interval : ' + intervalSetting) : '';
        }
      };
      init();
      slideshow.bind('showItem', function (e, p)
      {
        showItem(p);
      });
      slideshow.bind('previousItem', function ()
      {
        previous();
      });
      slideshow.bind('nextItem', function ()
      {
        next();
      });
      slideshow.find('.a-slideshow-image').click(function (event)
                                                 {
                                                   event.preventDefault();
                                                   intervalEnabled = false;
                                                   next();
                                                 });
      (debug) ? apostrophe.log('slideshowControls -- ' + slideshowControlsSelector + ' -- ' + slideshowControls.length) : '';
      slideshowControls.find('.a-arrow-left').click(function (event)
                                                    {
                                                      event.preventDefault();
                                                      intervalEnabled = false;
                                                      previous();
                                                    });
      slideshowControls.find('.a-arrow-right').click(function (event)
                                                     {
                                                       event.preventDefault();
                                                       intervalEnabled = false;
                                                       next();
                                                     });
      slideshowControls.find('.a-arrow-left, .a-arrow-right').hover(function ()
                                                                    {
                                                                      $(this).addClass('over');
                                                                    }, function ()
                                                                    {
                                                                      $(this).removeClass('over');
                                                                    });
    }
  };
  this.buttonSlot = function (options)
  {
    var button = (options['button']) ? $(options['button']) : false;
    var rollover = (options['rollover']) ? options['rollover'] : false;
    apostrophe.slotEnhancements({slot: '#' + button.closest('.a-slot').attr('id'), editClass: 'a-options'});
    if (button.length)
    {
      if (rollover)
      {
        var link = button.find('.a-button-title .a-button-link');
        var image = button.find('.a-button-image img');
        image.hover(function ()
                    {
                      image.fadeTo(0, .65);
                    }, function ()
                    {
                      image.fadeTo(0, 1);
                    });
        link.hover(function ()
                   {
                     image.fadeTo(0, .65);
                   }, function ()
                   {
                     image.fadeTo(0, 1);
                   });
      }
      ;
    }
    else
    {
      apostrophe.log('apostrophe.buttonSlot -- no button found');
    }
    ;
  }
  this.afterAddingSlot = function (name)
  {
    $('#a-add-slot-form-' + name).hide();
  }
  this.areaEnableDeleteSlotButton = function (options)
  {
    $('#' + options['buttonId']).click(function ()
                                       {
                                         if (confirm(options['confirmPrompt']))
                                         {
                                           $(this).closest(".a-slot").fadeOut();
                                           $.post(options['url'], {}, function (data)
                                           {
                                             $("#a-slots-" + options['pageId'] + "-" + options['name']).html(data);
                                           });
                                         }
                                         return false;
                                       });
  }
  this.areaEnableAddSlotChoice = function (options)
  {
    var debug = options['debug'];
    var button = $("#" + options['buttonId']);
    (debug) ? apostrophe.log('apostrophe.areaEnableAddSlotChoice -- Debug') : '';
    (debug) ? apostrophe.log(button) : '';
    $(button).click(function ()
                    {
                      var name = options['name'];
                      var pageId = options['pageId'];
                      $.post(options['url'], {}, function (data)
                      {
                        var slots = $('#a-slots-' + pageId + '-' + name);
                        slots.html(data);
                        var area = $('#a-area-' + pageId + '-' + name);
                        area.removeClass('a-options-open');
                      });
                      return false;
                    });
  }
  this.areaEnableHistoryButton = function (options)
  {
    var pageId = options['pageId'];
    var name = options['name'];
    var url = options['url'];
    var moreUrl = options['moreUrl'];
    var buttonId = options['buttonId'];
    $('#' + buttonId).click(function ()
                            {
                              _closeHistory();
                              _browseHistory($(this).closest('div.a-area'));
                              $(".a-history-browser .a-history-items").data("area", "a-area-" + pageId + "-" + name);
                              $(".a-history-browser .a-history-browser-view-more").click(function ()
                                                                                         {
                                                                                           $.post(moreUrl, {}, function (data)
                                                                                           {
                                                                                             $('.a-history-browser .a-history-items').html(data);
                                                                                             $(".a-history-browser .a-history-browser-view-more .spinner").hide();
                                                                                           });
                                                                                           $(this).hide();
                                                                                           return false;
                                                                                         });
                              $.post(url, {}, function (data)
                              {
                                $('.a-history-browser .a-history-items').html(data);
                              });
                              return false;
                            });
  }
  this.areaUpdateMoveButtons = function (updateAction, id, name)
  {
    var area = $('#a-area-' + id + '-' + name);
    var slots = area.children('.a-slots').children('.a-slot');
    var newSlots = area.children('.a-slots').children('.a-new-slot');
    for (n = 0; (n < slots.length); n++)
    {
      var slot = slots[n];
      slotUpdateMoveButtons(id, name, slot, n, slots, updateAction);
    }
    if (newSlots.length)
    {
      newSlots.find('.a-slot-controls .a-move').addClass('a-hidden');
      newSlots.next('.a-slot').find('.a-move.up').addClass('a-hidden');
      newSlots.prev('.a-slot').find('.a-move.down').addClass('a-hidden');
      return;
    }
  }
  this.areaHighliteNewSlot = function (options)
  {
    var pageId = options['pageId'];
    var slotName = options['slotName'];
    var newSlot = $('#a-area-' + pageId + '-' + slotName).find('.a-new-slot');
    if (newSlot.length)
    {
      var tmpBG = newSlot.css('background');
      newSlot.css({'background': 'none'});
      newSlot.effect("highlight", {}, 1000, function ()
      {
        newSlot.css({'background': tmpBG});
      });
      $('#a-add-slot-' + pageId + '-' + slotName).parent().trigger('toggleClosed');
    }
    ;
  }
  this.areaSingletonSlot = function (options)
  {
    var pageId = options['pageId'];
    var slotName = options['slotName'];
    $('#a-area-' + pageId + '-' + slotName + '.singleton .a-slot-controls-moved').remove();
    $('#a-area-' + pageId + '-' + slotName + '.singleton .a-slot-controls').prependTo($('#a-area-' + pageId + '-' + slotName)).addClass('a-area-controls a-slot-controls-moved').removeClass('a-slot-controls');
    $('ul.a-slot-controls-moved a.a-btn.a-history-btn').removeClass('big');
  }
  this.slotEnableVariantButton = function (options)
  {
    var button = $('#' + options['buttonId']);
    button.unbind('click.slotEnableVariantButton');
    button.bind('click.slotEnableVariantButton', function ()
    {
      var variants = $('#a-' + options['slotFullId'] + '-variant');
      variants.find('ul.a-variant-options').addClass('loading');
      variants.find('li.active').hide();
      variants.find('ul.a-variant-options li.inactive').show();
      var variantStem = '#a-' + options['slotFullId'] + '-variant-' + options['variant'];
      $(variantStem + '-active').show();
      $(variantStem + '-inactive').hide();
      variants.find('ul.a-variant-options').hide();
      $.post(options['url'], {}, function (data)
      {
        $('#' + options['slotContentId']).html(data);
      });
      return false;
    });
  }
  this.slotShowVariantsMenu = function (slot)
  {
    var outerWrapper = $(slot);
    var singletonArea = outerWrapper.closest('.singleton');
    if (singletonArea.length)
    {
      singletonArea.find('.a-controls li.variant').show();
    }
    else
    {
      outerWrapper.find('.a-controls li.variant').show();
    }
  }
  this.slotHideVariantsMenu = function (menu)
  {
    var menu = $(menu);
    menu.removeClass('loading').fadeOut('slow').parent().removeClass('open');
  }
  this.slotApplyVariantClass = function (slot, variant)
  {
    var outerWrapper = $(slot);
    outerWrapper.addClass(variant);
  }
  this.slotRemoveVariantClass = function (slot, variant)
  {
    var outerWrapper = $(slot);
    outerWrapper.removeClass(variant);
  }
  this.slotEnhancements = function (options)
  {
    var slot = $(options['slot']);
    var editClass = options['editClass'];
    if (slot.length)
    {
      if (editClass)
      {
        ;
      }
      {
        slot.find('.a-edit-view').addClass(editClass);
      }
      ;
    }
    else
    {
      apostrophe.log('apostrophe.slotEnhancements -- No slot found.');
      apostrophe.log('apostrophe.slotEnhancements -- Selector: ' + options['slot']);
    }
    ;
  }
  this.slotShowEditView = function (pageid, name, permid, realUrl)
  {
    var fullId = pageid + '-' + name + '-' + permid;
    var editSlot = $('#a-slot-' + fullId);
    if (!editSlot.children('.a-slot-content').children('.a-slot-form').length)
    {
      $.get(editSlot.data('a-edit-url'), {id: pageid, slot: name, permid: permid, realUrl: realUrl}, function (data)
      {
        editSlot.children('.a-slot-content').html(data);
        slotShowEditViewPreloaded(pageid, name, permid);
      });
    }
    else
    {
      slotShowEditViewPreloaded(pageid, name, permid);
    }
  }
  this.slotNotNew = function (pageid, name, permid)
  {
    $("#a-slot-" + pageid + "-" + name + "-" + permid).removeClass('a-new-slot');
  }
  this.slotEnableEditButton = function (pageid, name, permid, editUrl, realUrl)
  {
    var fullId = pageid + '-' + name + '-' + permid;
    var editBtn = $('#a-slot-edit-' + fullId);
    var editSlot = $('#a-slot-' + fullId);
    editSlot.data('a-edit-url', editUrl);
    editBtn.live('click.apostrophe', function (event)
    {
      apostrophe.slotShowEditView(pageid, name, permid, realUrl);
      return false;
    });
  }
  this.slotEnableForm = function (options)
  {
    $(options['slot-form']).submit(function ()
                                   {
                                     apostrophe.updating(options['slot-form']);
                                     $.post(options['url'], $(options['slot-form']).serialize(), function (data)
                                     {
                                       $(options['slot-content']).html(data);
                                     }, 'html');
                                     return false;
                                   });
  }
  this.slotEnableFormButtons = function (options)
  {
    var view = $(options['view']);
    $(options['cancel']).click(function (e)
                               {
                                 e.preventDefault();
                                 $(view).children('.a-slot-content').children('.a-slot-content-container').fadeIn();
                                 $(view).children('.a-controls li.variant').fadeIn();
                                 $(view).children('.a-slot-content').children('.a-slot-form').hide();
                                 $(view).find('.a-editing').removeClass('a-editing').addClass('a-normal');
                                 $(view).parents('.a-area.a-editing').removeClass('a-editing').addClass('a-normal').find('.a-editing').removeClass('a-editing').addClass('a-normal');
                               });
    $(options['save']).click(function ()
                             {
                               $(view).find('.a-editing').removeClass('a-editing').addClass('a-normal');
                               $(view).parents('.a-area.a-editing').removeClass('a-editing').addClass('a-normal').find('.a-editing').removeClass('a-editing').addClass('a-normal');
                               window.apostrophe.callOnSubmit(options['slot-full-id']);
                               return true;
                             });
    if (options['showEditor'])
    {
      var editBtn = $(options['edit']);
      editBtn.parents('.a-slot, .a-area').addClass('a-editing').removeClass('a-normal');
    }
  }
  this.mediaCategories = function (options)
  {
    var newCategoryLabel = options['newCategoryLabel'];
    apostrophe.selfLabel('#a_media_category_name', newCategoryLabel);
    $('#a-media-edit-categories-button, #a-media-no-categories-messagem, #a-category-sidebar-list').hide();
    $('#a_media_category_description').parents('div.a-form-row').addClass('hide-description').parent().attr('id', 'a-media-category-form');
    $('.a-remote-submit').aRemoteSubmit('#a-media-edit-categories');
  }
  this.mediaClearSelectingOnNavAway = function (mediaClearSelectingUrl)
  {
    $('a').click(function ()
                 {
                   var href = $(this).attr('href');
                   if (href === undefined)
                   {
                     return;
                   }
                   if (href.substr(0, 1) === '#')
                   {
                     return;
                   }
                   if (href.match(/\/admin\/media/))
                   {
                     return;
                   }
                   apostrophe.log("Cancelling select for " + href);
                   $.ajax({url: mediaClearSelectingUrl, async: false});
                   return;
                 });
  }
  this.mediaEnableRemoveButton = function (i)
  {
    var editor = $('#a-media-item-' + i);
    editor.find('.a-media-delete-image-btn').click(function ()
                                                   {
                                                     editor.remove();
                                                     if ($('.a-media-item').length == 0)
                                                     {
                                                       document.location = $('.a-js-media-edit-multiple-cancel').attr('href');
                                                     }
                                                     return false;
                                                   });
  }
  this.mediaReplaceFileListener = function (options)
  {
    var menu = $(options['menu']);
    var input = $(options['input']);
    var message = 'This file will be replaced with the new file you have selected after you click save.';
    var fileLabel = 'File: ';
    if (options['message'])
    {
      message = options['message'];
    }
    ;
    if (options['fileLabel'])
    {
      fileLabel = options['fileLabel'];
    }
    ;
    if (input.length)
    {
      input.change(function ()
                   {
                     if (input.val())
                     {
                       menu.trigger('toggleClosed');
                       var newFileMessage = $('<div/>');
                       newFileMessage.html('<div class="a-options open"><p>' + message + '</p><p>' + fileLabel + '<span>' + input.val() + '</span>' + '</p></div>');
                       newFileMessage.addClass('a-new-file-message help');
                       apostrophe.log(newFileMessage);
                       input.closest('.a-form-row').append(newFileMessage);
                     }
                     ;
                   });
    }
    else
    {
      apostrophe.log('apostrophe.mediaReplaceFileListener -- no input found');
    }
    ;
  }
  this.mediaAjaxSubmitListener = function (options)
  {
    var form = $(options['form']);
    var url = options['url'];
    var update = $(options['update']);
    var file = form.find('input[type="file"]');
    var descId = options['descId'];
    var fck = $('#' + descId);
    var embedChanged = false;
    if (form.length)
    {
      form.find('.a-form-row.embed textarea').change(function ()
                                                     {
                                                       embedChanged = true;
                                                     });
      form.submit(function (event)
                  {
                    if (fck.length)
                    {
                      fck.val(FCKeditorAPI.GetInstance(descId).GetXHTML());
                    }
                    ;
                    apostrophe.log(embedChanged);
                    if ((file.val() == '') && (!embedChanged))
                    {
                      event.preventDefault();
                      $.post(url, form.serialize(), function (data)
                      {
                        update.html(data);
                      });
                    }
                  });
    }
    else
    {
      apostrophe.log('apostrophe.mediaAjaxSubmitListener -- No form found');
    }
    ;
  }
  this.mediaFourUpLayoutEnhancements = function (options)
  {
    var items = $(options['selector']);
    if (typeof(items) == 'undefined' || !items.length)
    {
      apostrophe.log('apostrophe.mediaFourUpLayoutEnhancements -- Items is undefined or no items found');
      apostrophe.log(items);
    }
    items.mouseover(function ()
                    {
                      var item = $(this);
                      item.addClass('over');
                    }).mouseout(function ()
                                {
                                  var item = $(this);
                                  item.find('img').removeClass('dropshadow');
                                  item.removeClass('over');
                                }).mouseleave(function ()
                                              {
                                                var item = $(this);
                                                if (!item.data('hold_delete'))
                                                {
                                                  destroyItemSlug(item);
                                                }
                                                ;
                                              });
    items.find('.a-media-item-thumbnail').hoverIntent(function ()
                                                      {
                                                        var item = $(this).closest('.a-media-item');
                                                        if (!item.data('hold_create'))
                                                        {
                                                          createItemSlug(item);
                                                        }
                                                        ;
                                                      }, function ()
                                                      {
                                                      });
    items.each(function ()
               {
                 var item = $(this);
                 if (item.hasClass('a-type-video'))
                 {
                   item.unbind('embedToggle').find('.a-media-thumb-link').unbind('click').click(function ()
                                                                                                {
                                                                                                  return true;
                                                                                                });
                 }
                 ;
               });
    function createItemSlug(item)
    {
      var w = item.css('width');
      var h = item.css('height');
      var img = item.find('img');
      var slug = $('<div/>');
      slug.attr('id', item.attr('id') + '-slug');
      slug.addClass('a-media-item-slug');
      slug.css({width: w, height: h});
      if (item.hasClass('last'))
      {
        slug.addClass('last');
      }
      ;
      item.wrap(slug).addClass('dropshadow expand').data('hold_create', 1);
      var offset = '-' + Math.floor(img.attr('height') / 2) + 'px';
      item.css('margin-top', offset);
    }

    function destroyItemSlug(item)
    {
      if (item.parent('.a-media-item-slug').length)
      {
        item.unwrap();
      }
      ;
      item.removeClass('over dropshadow expand').css('margin-top', '').data('hold_create', null);
    }
  }
  this.mediaEnableLinkAccount = function (previewUrl)
  {
    var form = $('#a-media-add-linked-account');
    var ready = false;
    form.submit(function ()
                {
                  if (ready)
                  {
                    return true;
                  }
                  $('#a-media-account-preview-wrapper').load(previewUrl, $('#a-media-add-linked-account').serialize(), function ()
                  {
                    $('#a-account-preview-ok').click(function (event)
                                                     {
                                                       event.preventDefault();
                                                       ready = true;
                                                       form.submit();
                                                     });
                    $('#a-account-preview-cancel').click(function (event)
                                                         {
                                                           event.preventDefault();
                                                           $('#a-media-account-preview-wrapper').hide();
                                                           return false;
                                                         });
                    $('#a-media-account-preview-wrapper').show();
                  });
                  return false;
                });
  }
  this.mediaEmbeddableToggle = function (options)
  {
    var items = $(options['selector']);
    if (items.length)
    {
      items.each(function ()
                 {
                   var item = $(this);
                   item.bind('embedToggle', function ()
                   {
                     var embed = item.data('embed_code');
                     item.find('.a-media-item-thumbnail').addClass('a-previewing');
                     item.find('.a-media-item-embed').removeClass('a-hidden').html(embed);
                   });
                   var link = item.find('.a-media-play-video');
                   link.unbind('click.mediaEmbeddableToggle').bind('click.mediaEmbeddableToggle', function (e)
                   {
                     e.preventDefault();
                     item.trigger('embedToggle');
                   });
                 });
    }
    else
    {
      apostrophe.log('apostrophe.mediaEmbeddableToggle -- no items found');
    }
    ;
  }
  this.mediaAttachEmbed = function (options)
  {
    var id = options['id'];
    var embed = options['embed'];
    var mediaItem = $('#a-media-item-' + id);
    mediaItem.data('embed_code', embed);
  }
  this.mediaItemsIndicateSelected = function (cropOptions)
  {
    var ids = cropOptions.ids;
    aCrop.init(cropOptions);
    $('.a-media-selected-overlay').remove();
    $('.a-media-selected').removeClass('a-media-selected');
    var i;
    for (i = 0; (i < ids.length); i++)
    {
      id = ids[i];
      var selector = '#a-media-item-' + id;
      if (!$(selector).hasClass('a-media-selected'))
      {
        $(selector).addClass('a-media-selected');
      }
    }
    $('.a-media-item.a-media-selected').each(function ()
                                             {
                                               $(this).children('.a-media-item-thumbnail').prepend('<div class="a-media-selected-overlay"></div>');
                                             });
    $('.a-media-selection-help').hide();
    if (!ids.length)
    {
      $('.a-media-selection-help').show();
    }
    $('.a-media-selected-overlay').fadeTo(0, 0.66);
  }
  this.mediaUpdatePreview = function ()
  {
    $('#a-media-selection-preview').load(apostrophe.selectOptions.updateMultiplePreviewUrl, function ()
    {
      $('#a-media-selection-preview li:first').addClass('current');
      aCrop.resetCrop(true);
      apostrophe.mediaItemsIndicateSelected(apostrophe.selectOptions);
      var items = $('.a-media-selection-list-item');
      var listHeight = 0;
      items.each(function ()
                 {
                   var item = $(this);
                   (listHeight < item.height()) ? listHeight = item.height() : '';
                 });
      items.css('height', listHeight);
      apostrophe.log(listHeight);
    });
  }
  this.mediaDeselectItem = function (id)
  {
    $('#a-media-item-' + id).removeClass('a-media-selected');
    $('#a-media-item-' + id).children('.a-media-selected-overlay').remove();
  }
  this.mediaEnableSelect = function (options)
  {
    apostrophe.selectOptions = options;
    $('.a-media-selection-list-item .a-delete').unbind('click.aMedia').bind('click.aMedia', function (e)
    {
      var p = $(this).parents('.a-media-selection-list-item');
      var id = p.data('id');
      $.get(options['removeUrl'], {id: id}, function (data)
      {
        $('#a-media-selection-list').html(data);
        apostrophe.mediaDeselectItem(id);
        apostrophe.mediaUpdatePreview();
      });
      return false;
    });
    apostrophe.mediaItemsIndicateSelected(options);
    $('.a-media-selected-item-overlay').fadeTo(0, .35);
    $('.a-media-selection-list-item').hover(function ()
                                            {
                                              $(this).addClass('over');
                                            }, function ()
                                            {
                                              $(this).removeClass('over');
                                            });
    $('.a-media-thumb-link, .a-media-item-title-link').unbind('click.aMedia').bind('click.aMedia', function (e)
    {
      e.preventDefault();
      $.get(options['multipleAddUrl'], {id: $(this).data('id')}, function (data)
      {
        $('#a-media-selection-list').html(data);
        apostrophe.mediaUpdatePreview();
      });
      $(this).addClass('a-media-selected');
      return false;
    });
  }
  this.mediaItemRefresh = function (options)
  {
    var id = options['id'];
    var url = options['url'];
    window.location = url;
  }
  this.mediaEnableMultiplePreview = function ()
  {
    $('#a-media-selection-preview li:first').addClass('current');
    aCrop.resetCrop(true);
  }
  this.mediaEnableSelectionSort = function (multipleOrderUrl)
  {
    $('#a-media-selection-list').sortable({
                                            update: function (e, ui)
                                            {
                                              var serial = jQuery('#a-media-selection-list').sortable('serialize', {});
                                              $.post(multipleOrderUrl, serial);
                                            }
                                          });
  }
  this.mediaEnableUploadMultiple = function ()
  {
    function aMediaUploadSetRemoveHandler(element)
    {
      $(element).find('.a-close').click(function ()
                                        {
                                          var element = $($(this).parent().parent().parent()).remove();
                                          $('#a-media-upload-form-inactive').append(element);
                                          $('#a-media-add-photo').show();
                                          return false;
                                        });
    }

    $('#a-media-add-photo').click(function ()
                                  {
                                    var elements = $('#a-media-upload-form-inactive .a-form-row');
                                    $('#a-media-upload-form-subforms').append(elements);
                                    $('#a-media-add-photo').hide();
                                    return false;
                                  });
    function aMediaUploadInitialize()
    {
      $('#a-media-upload-form-inactive').append($('#a-media-upload-form-subforms .a-form-row.initially-inactive').remove());
      aMediaUploadSetRemoveHandler($('#a-media-upload-form-subforms'));
      $('#a-media-upload-form .a-cancel').click(function ()
                                                {
                                                  $('#a-media-add').hide();
                                                  return false;
                                                });
    }

    aMediaUploadInitialize();
  }
  this.menuToggle = function (options)
  {
    var button = options['button'];
    var menu;
    if (typeof(options[menu]) != "undefined")
    {
      menu = options[menu];
    }
    else
    {
      menu = $(button).parent();
    }
    var classname = options['classname'];
    var overlay = options['overlay'];
    if (typeof(button) == "undefined")
    {
      apostrophe.log('apostrophe.menuToggle -- Button is undefined');
    }
    else
    {
      if (typeof button == "string")
      {
        button = $(button);
      }
      if (typeof classname == "undefined" || classname == '')
      {
        classname = "show-options";
      }
      if (typeof overlay != "undefined" && overlay)
      {
        overlay = $('.a-page-overlay');
      }
      if (typeof(menu) == "object")
      {
        _menuToggle(button, menu, classname, overlay, options['beforeOpen'], options['afterClosed'], options['afterOpen'], options['beforeClosed'], options['focus'], options['debug']);
      }
      ;
    }
    ;
  }
  this.pager = function (selector, pagerOptions)
  {
    $(selector + ':not(.a-pager-processed)').each(function ()
                                                  {
                                                    var pager = $(this);
                                                    pager.addClass('a-pager-processed');
                                                    pager.find('.a-page-navigation-number').css('display', 'block');
                                                    pager.find('.a-page-navigation-number').css('float', 'left');
                                                    var nb_pages = parseInt(pagerOptions['nb-pages']);
                                                    var nb_links = parseInt(pagerOptions['nb-links']);
                                                    var selected = parseInt($(this).find('.a-page-navigation-number.a-pager-navigation-disabled').text());
                                                    (nb_links >= nb_pages) ? pager.addClass('a-pager-arrows-disabled') : pager.removeClass('a-pager-arrows-disabled');
                                                    var min = selected;
                                                    var max = selected + nb_links - 1;
                                                    var links_container_container = pager.find('.a-pager-navigation-links-container-container');
                                                    links_container_container.width((nb_links * pager.find('.a-page-navigation-number').first().outerWidth()));
                                                    links_container_container.css('overflow', 'hidden');
                                                    var links_container = pager.find('.a-pager-navigation-links-container');
                                                    links_container.width((nb_pages * pager.find('.a-page-navigation-number').first().outerWidth()));
                                                    var first = pager.find('.a-pager-navigation-first');
                                                    var prev = pager.find('.a-pager-navigation-previous');
                                                    var next = pager.find('.a-pager-navigation-next');
                                                    var last = pager.find('.a-pager-navigation-last')

                                                    function calculateMinAndMax()
                                                    {
                                                      if ((min < 1) && (max > nb_pages))
                                                      {
                                                        min = 1;
                                                        max = nb_pages;
                                                      }
                                                      else if (min < 1)
                                                      {
                                                        var diff = 0;
                                                        if (min < 0)
                                                        {
                                                          diff = 0 - min;
                                                          diff = diff + 1;
                                                        }
                                                        else
                                                        {
                                                          diff = 1
                                                        }
                                                        min = 1;
                                                        max = max + diff;
                                                      }
                                                      else if (max > nb_pages)
                                                      {
                                                        var diff = max - nb_pages;
                                                        max = nb_pages;
                                                        min = min - diff;
                                                      }
                                                    }

                                                    function toggleClasses()
                                                    {
                                                      pager.find('.a-pager-navigation-disabled').removeClass('a-pager-navigation-disabled');
                                                      if (min == 1)
                                                      {
                                                        first.addClass('a-pager-navigation-disabled');
                                                        prev.addClass('a-pager-navigation-disabled');
                                                      }
                                                      else if (min == ((nb_pages - nb_links) + 1))
                                                      {
                                                        next.addClass('a-pager-navigation-disabled');
                                                        last.addClass('a-pager-navigation-disabled');
                                                      }
                                                    }

                                                    function updatePageNumbers()
                                                    {
                                                      pager.find('.a-page-navigation-number').each(function ()
                                                                                                   {
                                                                                                     var current = parseInt($(this).text());
                                                                                                     if ((current >= min) && (current <= max))
                                                                                                     {
                                                                                                       $(this).show();
                                                                                                     }
                                                                                                     else
                                                                                                     {
                                                                                                       $(this).hide();
                                                                                                     }
                                                                                                   });
                                                    }

                                                    function animatePageNumbers()
                                                    {
                                                      var width = links_container.children('.a-page-navigation-number').first().outerWidth();
                                                      width = (min - 1) * -width;
                                                      links_container.animate({marginLeft: width}, 250, 'swing');
                                                    }

                                                    next.click(function (e)
                                                               {
                                                                 e.preventDefault();
                                                                 min = min + nb_links;
                                                                 max = max + nb_links;
                                                                 calculateMinAndMax();
                                                                 toggleClasses();
                                                                 animatePageNumbers();
                                                                 return false;
                                                               });
                                                    last.click(function (e)
                                                               {
                                                                 e.preventDefault();
                                                                 min = nb_pages;
                                                                 max = nb_pages + nb_links - 1;
                                                                 calculateMinAndMax();
                                                                 toggleClasses();
                                                                 animatePageNumbers();
                                                                 return false;
                                                               });
                                                    prev.click(function (e)
                                                               {
                                                                 e.preventDefault();
                                                                 min = min - nb_links;
                                                                 max = max - nb_links;
                                                                 calculateMinAndMax();
                                                                 toggleClasses();
                                                                 animatePageNumbers();
                                                                 return false;
                                                               });
                                                    first.click(function (e)
                                                                {
                                                                  e.preventDefault();
                                                                  min = 1;
                                                                  max = nb_links;
                                                                  calculateMinAndMax();
                                                                  toggleClasses();
                                                                  animatePageNumbers();
                                                                  return false;
                                                                });
                                                    calculateMinAndMax();
                                                    toggleClasses();
                                                    animatePageNumbers();
                                                  });
  }
  this.accordion = function (options)
  {
    var toggle = options['accordion_toggle'];
    if (typeof toggle == "undefined")
    {
      apostrophe.log('apostrophe.accordion -- Toggle is undefined.');
    }
    else
    {
      if (typeof toggle == "string")
      {
        toggle = $(toggle);
      }
      var container = toggle.parent();
      var content = toggle.next();
      container.addClass('a-accordion');
      content.addClass('a-accordion-content');
      toggle.each(function ()
                  {
                    var t = $(this);
                    t.click(function (event)
                            {
                              event.preventDefault();
                              t.closest('.a-accordion').toggleClass('open');
                            }).hover(function ()
                                     {
                                       t.addClass('hover');
                                     }, function ()
                                     {
                                       t.removeClass('hover');
                                     });
                  }).addClass('a-accordion-toggle');
    }
    ;
  }
  this.enablePageSettings = function (options)
  {
    apostrophe.log('apostrophe.enablePageSettings');
    var form = $('#' + options['id'] + '-form');
    $('#' + options['id'] + '-submit').click(function ()
                                             {
                                               form.submit();
                                             });
    var ajaxDirty = false;
    form.submit(function ()
                {
                  tryPost();
                  return false;
                });
    function tryPost()
    {
      if (ajaxDirty)
      {
        setTimeout(tryPost, 250);
      }
      else
      {
        $.post(options['url'], form.serialize(), function (data)
        {
          $('.a-page-overlay').hide();
          apostrophe.log(data);
          $('#' + options['id']).html(data);
        });
      }
    }

    if (options['new'])
    {
      var slugField = form.find('[name="settings[slug]"]');
      var titleField = form.find('[name="settings[realtitle]"]');
      var timeout = null;

      function changed()
      {
        ajaxDirty = true;
        $.get(options['slugifyUrl'], {slug: $(titleField).val()}, function (data)
        {
          slugField.val(options['slugStem'] + '/' + data);
          ajaxDirty = false;
        });
        timeout = null;
      }

      function setChangedTimeout()
      {
        if (!timeout)
        {
          timeout = setTimeout(changed, 500);
        }
      }

      titleField.focus();
      titleField.change(changed);
      titleField.keyup(setChangedTimeout);
      $(form).find('.a-more-options-btn').click(function (e)
                                                {
                                                  e.preventDefault();
                                                  $(this).hide().next().removeClass('a-hidden');
                                                });
    }
    var joinedtemplate = form.find('[name="settings[joinedtemplate]"]');
    joinedtemplate.change(function ()
                          {
                            updateEngineAndTemplate();
                          });
    function updateEngineAndTemplate()
    {
      var url = options['engineUrl'];
      var engineSettings = form.find('.a-engine-page-settings');
      var val = joinedtemplate.val().split(':')[0];
      if (val === 'a')
      {
        engineSettings.html('');
      }
      else
      {
        $.get(url, {id: options['pageId'] ? options['pageId'] : 0, engine: val}, function (data)
        {
          engineSettings.html(data);
        });
      }
    }

    updateEngineAndTemplate();
  }
  this.accordionEnhancements = function (options)
  {
    var nurl = options['url'];
    var name = options['name'];
    var nest = options['nest'];
    var nav = $("#a-nav-" + name + "-" + nest);
    nav.sortable({
                   delay: 100, update: function (e, ui)
      {
        var serial = nav.sortable('serialize', {key: 'a-tab-nav-item[]'});
        var options = {"url": nurl, "type": "post"};
        options['data'] = serial;
        $.ajax(options);
        nav.children().removeClass('first second next-last last');
        nav.children(':first').addClass('first');
        nav.children(':last').addClass('last');
        nav.children(':first').next("li").addClass('second');
        nav.children(':last').prev("li").addClass('next-last');
      }, items: 'li:not(.extra)'
                 });
  };
  this.allTagsToggle = function (options)
  {
    var allTags = options['selector'] ? $(options['selector']) : $('.a-tag-sidebar-title.all-tags');
    allTags.hover(function ()
                  {
                    allTags.addClass('over');
                  }, function ()
                  {
                    allTags.removeClass('over');
                  });
    allTags.click(function ()
                  {
                    allTags.toggleClass('open');
                    allTags.next().toggle();
                  });
  };
  this.searchCancel = function (options)
  {
    var search = options['search'];
    $('#a-media-search-remove').show();
    $('#a-media-search-submit').hide();
    $('#a-media-search').bind("keyup blur", function (e)
    {
      if ($(this).val() === search)
      {
        $('#a-media-search-remove').show();
        $('#a-media-search-submit').hide();
      }
      else
      {
        $('#a-media-search-remove').hide();
        $('#a-media-search-submit').show();
      }
    });
    $('#a-media-search').bind('aInputSelfLabelClear', function (e)
    {
      $('#a-media-search-remove').show();
      $('#a-media-search-submit').hide();
    });
  };
  this.smartCSS = function (options)
  {
    var target = 'body';
    if (options && options['target'])
    {
      target = options['target'];
    }
    ;
    $(target).find('.a-inject-actual-url').each(function ()
                                                {
                                                  var href = $(this).attr('href');
                                                  var parsed = apostrophe.parseUrl(href);
                                                  if (parsed.queryData.after !== undefined)
                                                  {
                                                    var afterParsed = apostrophe.parseUrl(parsed.queryData.after);
                                                    afterParsed.queryData.actual_url = window.location.href;
                                                    afterParsed.query = $.param(afterParsed.queryData);
                                                    parsed.queryData.after = afterParsed.stem + afterParsed.query;
                                                    parsed.query = $.param(parsed.queryData);
                                                    href = parsed.stem + parsed.query;
                                                    $(this).attr('href', href);
                                                  }
                                                });
    var actAsSubmit = $(target).find('.a-act-as-submit');
    actAsSubmit.unbind('click.aActAsSubmit');
    actAsSubmit.bind('click.aActAsSubmit', function ()
    {
      var form = $(this).parents('form:first');
      var name = $(this).attr('name');
      if (name && name.length)
      {
        var hidden = $('<input type="hidden"></input>');
        hidden.attr('name', name);
        hidden.attr('value', 1);
        form.append(hidden);
        form = $(this).parents('form:first');
      }
      form.submit();
      return false;
    });
    $('a.a-variant-options-toggle').unbind('click.aVariantOptionsToggle').bind('click.aVariantOptionsToggle', function ()
    {
      $(this).parents('.a-slots').children().css('z-index', '699');
      $(this).parents('.a-slot').css('z-index', '799');
    });
    $('.a-nav .a-archived-page').fadeTo(0, .5);
    $('.a-controls, .a-options').addClass('clearfix');
    $('.a-controls li:last-child').addClass('last');
    $('a[rel="external"]').attr('target', '_blank');
    var aBtns = $(target).find('.a-btn,.a-submit,.a-cancel');
    aBtns.each(function ()
               {
                 var aBtn = $(this);
                 if (aBtn.is('a') && aBtn.hasClass('icon') && !aBtn.children('.icon').length)
                 {
                   aBtn.prepend('<span class="icon"></span>').addClass('a-fix-me');
                 }
                 ;
               });
  }
  this.parseUrl = function (url)
  {
    var info = {};
    var q = url.indexOf('?');
    if (q !== -1)
    {
      info.stem = url.substr(0, q + 1);
      query = url.substr(q + 1);
      info.query = query;
      info.queryData = apostrophe.decodeQuery(query);
    }
    else
    {
      info.stem = url;
      info.query = '';
      info.queryData = {};
    }
    return info;
  }
  this.decodeQuery = function (query)
  {
    var urlParams = {};
    (function ()
    {
      var e, a = /\+/g, r = /([^&=]+)=?([^&]*)/g, d = function (s)
      {
        return decodeURIComponent(s.replace(a, " "));
      }, q = query;
      while (e = r.exec(q))
      {
        urlParams[d(e[1])] = d(e[2]);
      }
    })();
    return urlParams;
  }
  this.audioPlayerSetup = function (aAudioContainer, file)
  {
    aAudioContainer = $(aAudioContainer);
    if (typeof(aAudioContainer) == 'object' && aAudioContainer.length)
    {
      var global_lp = 0;
      var global_wtf = 0;
      var btnPlay = aAudioContainer.find(".a-audio-play");
      var btnPause = aAudioContainer.find(".a-audio-pause");
      var sliderPlayback = aAudioContainer.find('.a-audio-playback');
      var sliderVolume = aAudioContainer.find('.a-audio-volume');
      var loadingBar = aAudioContainer.find('.a-audio-loader');
      var time = aAudioContainer.find('.a-audio-time');
      var aAudioPlayer = aAudioContainer.find('.a-audio-player');
      var aAudioInterface = aAudioContainer.find('.a-audio-player-interface');
      aAudioPlayer.jPlayer({
                             ready: function ()
                             {
                               this.element.jPlayer("setFile", file);
                               aAudioInterface.removeClass('a-loading');
                             }, swfPath: '/apostrophePlugin/swf', customCssIds: true
                           }).jPlayer("onProgressChange", function (lp, ppr, ppa, pt, tt)
      {
        var lpInt = parseInt(lp);
        var ppaInt = parseInt(ppa);
        global_lp = lpInt;
        loadingBar.progressbar('option', 'value', lpInt);
        sliderPlayback.slider('option', 'value', ppaInt);
        if (global_wtf && global_wtf == parseInt(tt))
        {
          timeLeft = parseInt(tt) - parseInt(pt);
          time.text($.jPlayer.convertTime(timeLeft));
        }
        else
        {
          global_wtf = parseInt(tt);
        }
      }).jPlayer("onSoundComplete", function ()
      {
      });
      btnPause.hide();
      loadingBar.progressbar();
      btnPlay.click(function ()
                    {
                      aAudioPlayer.jPlayer("play");
                      btnPlay.hide();
                      btnPause.show();
                      return false;
                    });
      btnPause.click(function ()
                     {
                       aAudioPlayer.jPlayer("pause");
                       btnPause.hide();
                       btnPlay.show();
                       return false;
                     });
      sliderPlayback.slider({
                              max: 100, range: 'min', animate: false, slide: function (event, ui)
        {
          aAudioPlayer.jPlayer("playHead", ui.value * (100.0 / global_lp));
        }
                            });
      sliderVolume.slider({
                            value: 50, max: 100, range: 'min', animate: false, slide: function (event, ui)
        {
          aAudioPlayer.jPlayer("volume", ui.value);
        }
                          });
    }
    else
    {
      throw"Cannot find DOM Element for Audio Player.";
    }
  }
  this.enablePermissionsToggles = function ()
  {
    var stem = '.view-options-widget';
    $(stem).change(function ()
                   {
                     var v = $(stem + ':checked').val();
                     if (v === 'login')
                     {
                       $('#a-page-permissions-view-extended').show();
                     }
                     else
                     {
                       $('#a-page-permissions-view-extended').hide();
                     }
                   });
    $('#a_settings_settings_view_options_public').change();
    $('#a_settings_settings_edit_admin_lock').change(function ()
                                                     {
                                                       if ($(this).attr('checked'))
                                                       {
                                                         $('#a-page-permissions-edit-extended').hide();
                                                       }
                                                       else
                                                       {
                                                         $('#a-page-permissions-edit-extended').show();
                                                       }
                                                     });
    $('#a_settings_settings_edit_admin_lock').change();
  }
  this.enablePermissions = function (options)
  {
    var w = $('#' + options['id']);
    var ids = [];
    var input = eval($('#' + options['hiddenField']).val());
    for (var i = 0; (i < input.length); i++)
    {
      ids[ids.length] = input[i]['id'];
    }
    var data = {};
    for (var i = 0; (i < ids.length); i++)
    {
      data[ids[i]] = input[i];
    }
    function rebuild()
    {
      var select = $('<select class="a-permissions-add"></select>');
      var list = $('<ul class="a-permissions-entries"></ul>');
      var option = $('<option></option>');
      option.val('');
      option.text(options['addLabel']);
      select.append(option);
      var j = 0;
      for (var i = 0; (i < ids.length); i++)
      {
        var user = data[ids[i]];
        var id = user['id'];
        var who = user['name'];
        if (!user['selected'])
        {
          var option = $('<option></option>');
          option.val(id);
          option.text(who);
          select.append(option);
        }
        else
        {
          var liMarkup = '<li class="a-permission-entry ' + ((j % 2) ? 'even' : 'odd') + ' clearfix"><ul><li class="a-who"></li>';
          if (options['extra'])
          {
            liMarkup += '<li class="a-cascade-option extra"><div class="cascade-checkbox"><input type="checkbox" value="1" /> ' + options['extraLabel'] + '</div></li>';
          }
          if (options['hasSubpages'])
          {
            liMarkup += '<li class="a-cascade-option apply-to-subpages"><div class="cascade-checkbox"><input type="checkbox" value="1" /> ' + options['applyToSubpagesLabel'] + '</div></li>';
          }
          liMarkup += '<li class="a-actions"><a href="#" class="a-close-small a-btn icon no-label no-bg alt">' + options['removeLabel'] + '<span class="icon"></span></a></li></ul></li>';
          li = $(liMarkup);
          li.find('.a-who').text(who);
          if (options['extra'])
          {
            li.find('.extra [type=checkbox]').attr('checked', user['extra']);
          }
          li.find('.apply-to-subpages [type=checkbox]').attr('checked', user['applyToSubpages']);
          li.data('id', id);
          if (user['selected'] === 'remove')
          {
            li.addClass('a-removing');
            li.find('.a-extra input').attr('disabled', true);
          }
          list.append(li);
          j++;
        }
      }
      select.val('');
      select.change(function ()
                    {
                      var id = select.val();
                      data[id]['selected'] = true;
                      rebuild();
                      return false;
                    });
      list.find('.a-close-small').click(function ()
                                        {
                                          var id = $(this).parents('.a-permission-entry').data('id');
                                          var user = data[id];
                                          if (user['selected'] === 'remove')
                                          {
                                            user['selected'] = true;
                                          }
                                          else
                                          {
                                            user['selected'] = 'remove';
                                          }
                                          rebuild();
                                          return false;
                                        });
      list.find('.extra [type=checkbox]').change(function ()
                                                 {
                                                   var id = $(this).parents('.a-permission-entry').data('id');
                                                   data[id]['extra'] = $(this).attr('checked');
                                                   updateHiddenField();
                                                   return true;
                                                 });
      list.find('.apply-to-subpages [type=checkbox]').change(function ()
                                                             {
                                                               var id = $(this).parents('.a-permission-entry').data('id');
                                                               data[id]['applyToSubpages'] = $(this).attr('checked');
                                                               updateHiddenField();
                                                               return true;
                                                             });
      w.html('');
      w.append(list);
      w.append(select);
      updateHiddenField();
    }

    rebuild();
    function updateHiddenField()
    {
      var flat = [];
      for (var i = 0; (i < ids.length); i++)
      {
        flat[flat.length] = data[ids[i]];
      }
      $('#' + options['hiddenField']).val(JSON.stringify(flat));
    }
  }
  this.enableMediaEditMultiple = function ()
  {
    $('.a-media-multiple-submit-button').click(function ()
                                               {
                                                 $('#a-media-edit-form-0').submit();
                                                 return false;
                                               });
    $('#a-media-edit-form-0').submit(function ()
                                     {
                                       return true;
                                     });
    $('#a-media-edit-form-0 .a-media-editor .a-delete').click(function ()
                                                              {
                                                                $(this).parents('.a-media-editor').remove();
                                                                if ($('#a-media-edit-form-0 .a-media-editor').length === 0)
                                                                {
                                                                  window.location.href = $('#a-media-edit-form-0 .a-controls .a-cancel:first').attr('href');
                                                                }
                                                                return false;
                                                              });
  }
  this.aAdminEnableFilters = function ()
  {
    $('#a-admin-filters-open-button').click(function ()
                                            {
                                              $('#a-admin-filters-container').slideToggle();
                                              return false;
                                            });
  }
  this.historyOpen = function (options)
  {
    var id = options['id'];
    var name = options['name'];
    var versionsInfo = options['versionsInfo'];
    var all = options['all'];
    var revert = options['revert'];
    var revisionsLabel = options['revisionsLabel'];
    for (i = 0; (i < versionsInfo.length); i++)
    {
      version = versionsInfo[i].version;
      $("#a-history-item-" + version).data('params', {
        'preview': {id: id, name: name, subaction: 'preview', version: version},
        'revert': {id: id, name: name, subaction: 'revert', version: version},
        'cancel': {id: id, name: name, subaction: 'cancel', version: version}
      });
    }
    if ((versionsInfo.length == 10) && (!all))
    {
      $('#a-history-browser-view-more').show();
    }
    else
    {
      $('#a-history-browser-view-more').hide().before('&nbsp;');
    }
    $('#a-history-browser-number-of-revisions').text(versionsInfo.length + revisionsLabel);
    $('.a-history-browser-view-more').mousedown(function ()
                                                {
                                                  $(this).children('img').fadeIn('fast');
                                                });
    $('.a-history-item').click(function ()
                               {
                                 $('.a-history-browser').hide();
                                 var params = $(this).data('params');
                                 var targetArea = "#" + $(this).parent().data('area');
                                 var historyBtn = $(targetArea + ' .a-area-controls a.a-history');
                                 var cancelBtn = $('#a-history-cancel-button');
                                 var revertBtn = $('#a-history-revert-button');
                                 $(historyBtn).siblings('.a-history-options').show();
                                 $.post(revert, params.preview, function (result)
                                 {
                                   $('#a-slots-' + id + '-' + name).html(result);
                                   $(targetArea).addClass('previewing-history');
                                   historyBtn.addClass('a-disabled');
                                   $('.a-page-overlay').hide();
                                 });
                                 revertBtn.click(function ()
                                                 {
                                                   $.post(revert, params.revert, function (result)
                                                   {
                                                     $('#a-slots-' + id + '-' + name).html(result);
                                                     historyBtn.removeClass('a-disabled');
                                                     _closeHistory();
                                                   });
                                                 });
                                 cancelBtn.click(function ()
                                                 {
                                                   $.post(revert, params.cancel, function (result)
                                                   {
                                                     $('#a-slots-' + id + '-' + name).html(result);
                                                     historyBtn.removeClass('a-disabled');
                                                     _closeHistory();
                                                   });
                                                 });
                               });
    $('.a-history-item').hover(function ()
                               {
                                 $(this).css('cursor', 'pointer');
                               }, function ()
                               {
                                 $(this).css('cursor', 'default');
                               });
  }
  this.enableCloseHistoryButtons = function (options)
  {
    var closeHistoryBtns = $(options['close_history_buttons']);
    closeHistoryBtns.click(function ()
                           {
                             _closeHistory();
                           });
  }
  this.enablePageSettingsButtons = function (options)
  {
    var aPageSettingsURL = options['aPageSettingsURL'];
    var aPageSettingsCreateURL = options['aPageSettingsCreateURL'];
    apostrophe.menuToggle({
                            "button": "#a-page-settings-button", "classname": "", "overlay": true, "beforeOpen": function ()
      {
        $.ajax({
                 type: 'POST', dataType: 'html', success: function (data, textStatus)
          {
            $('#a-page-settings').html(data);
          }, complete: function (XMLHttpRequest, textStatus)
          {
          }, url: aPageSettingsURL
               });
      }, "afterClosed": function ()
      {
        $('#a-page-settings').html('');
      }
                          });
    apostrophe.menuToggle({
                            "button": "#a-create-page-button", "classname": "", "overlay": true, "beforeOpen": function ()
      {
        $.ajax({
                 type: 'POST', dataType: 'html', success: function (data, textStatus)
          {
            $('#a-create-page').html(data);
          }, complete: function (XMLHttpRequest, textStatus)
          {
          }, url: aPageSettingsCreateURL
               });
      }, "afterClosed": function ()
      {
        $('#a-create-page').html('');
      }
                          });
  }
  this.enableUserAdmin = function (options)
  {
    $('.a-admin #a-admin-filters-container #a-admin-filters-form .a-form-row .a-admin-filter-field br').replaceWith('<div class="a-spacer"></div>');
    aMultipleSelectAll({'choose-one': options['choose-one-label']});
  }
  function slotUpdateMoveButtons(id, name, slot, n, slots, updateAction)
  {
    var up = $(slot).find('.a-arrow-up:first');
    var down = $(slot).find('.a-arrow-down:first');
    if (n > 0)
    {
      up.parent().removeClass('a-hidden');
      up.unbind('click.apostrophe').bind('click.apostrophe', function ()
      {
        $.get(updateAction, {id: id, name: name, permid: $(slot).data('a-permid'), up: 1});
        apostrophe.swapNodes(slot, slots[n - 1]);
        apostrophe.areaUpdateMoveButtons(updateAction, id, name);
        apostrophe.log('move up');
        return false;
      });
    }
    else
    {
      up.parent().addClass('a-hidden');
    }
    if (n < (slots.length - 1))
    {
      down.parent().removeClass('a-hidden');
      down.unbind('click.apostrophe').bind('click.apostrophe', function ()
      {
        $.get(updateAction, {id: id, name: name, permid: $(slot).data('a-permid'), up: 0});
        apostrophe.swapNodes(slot, slots[n + 1]);
        apostrophe.areaUpdateMoveButtons(updateAction, id, name);
        apostrophe.log('move down');
        return false;
      });
    }
    else
    {
      down.parent().addClass('a-hidden');
    }
  }

  function slotShowEditViewPreloaded(pageid, name, permid)
  {
    var fullId = pageid + '-' + name + '-' + permid;
    var editBtn = $('#a-slot-edit-' + fullId);
    var editSlot = $('#a-slot-' + fullId);
    editBtn.parents('.a-slot, .a-area').addClass('a-editing').removeClass('a-normal');
    editSlot.children('.a-slot-content').children('.a-slot-content-container').hide();
    editSlot.children('.a-slot-content').children('.a-slot-form').fadeIn();
    editSlot.children('.a-control li.variant').hide();
  }

  function _browseHistory(area)
  {
    var areaControls = area.find('ul.a-area-controls');
    var areaControlsTop = areaControls.offset().top;
    $('.a-page-overlay').fadeIn();
    if (!area.hasClass('browsing-history'))
    {
      $('.a-history-browser .a-history-items').html('<tr class="a-history-item"><td class="date"><img src="\/apostrophePlugin\/images\/a-icon-loader-2.gif"><\/td><td class="editor"><\/td><td class="preview"><\/td><\/tr>');
      area.addClass('browsing-history');
    }
    $('.a-history-browser').css('top', (areaControlsTop - 5) + "px");
    $('.a-history-browser').fadeIn();
    $('.a-page-overlay').click(function ()
                               {
                                 _closeHistory();
                                 $(this).unbind('click');
                               });
    $('#a-history-preview-notice-toggle').click(function ()
                                                {
                                                  $('.a-history-preview-notice').children(':not(".a-history-options")').slideUp();
                                                });
  }

  function _closeHistory()
  {
    $('a.a-history-btn').parents('.a-area').removeClass('browsing-history');
    $('a.a-history-btn').parents('.a-area').removeClass('previewing-history');
    $('.a-history-browser, .a-history-preview-notice').hide();
    $('body').removeClass('history-preview');
    $('.a-page-overlay').hide();
  }

  function _pageTemplateToggle(aPageTypeSelect, aPageTemplateSelect)
  {
  }

  function _menuToggle(button, menu, classname, overlay, beforeOpen, afterClosed, afterOpen, beforeClosed, focus, debug)
  {
    debug ? apostrophe.log('apostrophe.menuToggle -- debug -- #' + button.attr('id')) : '';
    if (menu.attr('id') == '')
    {
      newID = button.attr('id') + '-menu';
      menu.attr('id', newID).addClass('a-options-container');
    }
    button.unbind('click.menuToggle').bind('click.menuToggle', function (event)
    {
      event.preventDefault();
      if (!button.hasClass('aActiveMenu'))
      {
        menu.trigger('toggleOpen');
      }
      else
      {
        menu.trigger('toggleClosed');
      }
    }).addClass('a-options-button');
    if (beforeOpen)
    {
      menu.bind('beforeOpen', beforeOpen);
    }
    if (afterClosed)
    {
      menu.bind('afterClosed', afterClosed);
    }
    if (afterOpen)
    {
      menu.bind('afterOpen', afterOpen);
    }
    if (beforeClosed)
    {
      menu.bind('beforeClosed', beforeClosed);
    }
    var clickHandler = function (event)
    {
      var target = $(event.target);
      debug ? apostrophe.log('apostrophe.menuToggle -- clickHandler Target') : '';
      debug ? apostrophe.log(target) : '';
      if (target.hasClass('a-page-overlay') || target.hasClass('a-cancel') || (!target.parents().is('#' + menu.attr('id')) && !target.parents().hasClass('ui-widget')))
      {
        menu.trigger('toggleClosed');
      }
    };
    menu.unbind('toggleOpen').bind('toggleOpen', function ()
    {
      menu.trigger('beforeOpen');
      button.addClass('aActiveMenu');
      menu.parents().addClass('ie-z-index-fix');
      button.closest('.a-controls').addClass('aActiveMenu');
      menu.addClass(classname);
      if (overlay)
      {
        overlay.fadeIn();
      }
      $(document).bind('click.menuToggleClickHandler', clickHandler);
      if (focus)
      {
        $(focus).focus();
      }
      ;
      menu.trigger('afterOpen');
    });
    menu.unbind('toggleClosed').bind('toggleClosed', function ()
    {
      menu.trigger('beforeClosed');
      button.removeClass('aActiveMenu');
      menu.parents().removeClass('ie-z-index-fix');
      button.closest('.a-controls').removeClass('aActiveMenu');
      menu.removeClass(classname);
      if (overlay)
      {
        overlay.hide();
      }
      ;
      $(document).unbind('click.menuToggleClickHandler');
      menu.trigger('afterClosed');
    });
    $('#' + menu.attr('id') + ' .a-options-cancel').live('click', function (e)
    {
      e.preventDefault();
      menu.trigger('toggleClosed');
    });
  }
}
window.apostrophe = new aConstructor();
if (!Array.prototype.indexOf)
{
  Array.prototype.indexOf = function (elt)
  {
    var len = this.length >>> 0;
    var from = Number(arguments[1]) || 0;
    from = (from < 0) ? Math.ceil(from) : Math.floor(from);
    if (from < 0)
    {
      from += len;
    }
    for (; from < len; from++)
    {
      if (from in this && this[from] === elt)
      {
        return from;
      }
    }
    return -1;
  };
}
function aMultipleSelectAll(options)
{
  if (options === undefined)
  {
    options = {};
  }
  $(document).ready(function ()
                    {
                      aMultipleSelect('body', options);
                    });
}
function aMultipleSelect(target, options)
{
  if (options === undefined)
  {
    options = {};
  }
  $(target).find('select[multiple]').each(function (i)
                                          {
                                            var name = $(this).attr('name');
                                            var id = $(this).attr('id');
                                            var values = [];
                                            var labels = [];
                                            var selected = [];
                                            var j;
                                            var autocomplete = false;
                                            if (options['autocomplete'] !== undefined)
                                            {
                                              autocomplete = options['autocomplete'];
                                            }
                                            if (options['choose-one'])
                                            {
                                              values.push('');
                                              labels.push(options['choose-one']);
                                              selected.push(false);
                                            }
                                            for (j = 0; (j < this.options.length); j++)
                                            {
                                              var option = this.options[j];
                                              values.push(option.value);
                                              labels.push(option.innerHTML);
                                              selected.push(option.getAttribute('selected') || option.selected);
                                            }
                                            var length = values.length;
                                            var addIndex = undefined;
                                            if (options['add'])
                                            {
                                              var addIndex = values.length;
                                              values.push('_new');
                                              labels.push(options['add']);
                                              selected.push(false);
                                              var addName = name + '_add';
                                              if (name.substr(name.length - 3) === '][]')
                                              {
                                                addName = name.substr(0, name.length - 3) + '_add][]';
                                              }
                                              else if (name.substr(name.length - 2) === '[]')
                                              {
                                                addName = name.substr(0, name.length - 2) + '_add[]';
                                              }
                                              else if (name.substr(name.length - 1) === ']')
                                              {
                                                addName = name.substr(0, name.length - 1) + '_add]';
                                              }
                                            }
                                            if (id === '')
                                            {
                                              id = 'a_id_' + Math.floor(Math.random() * 1000000000);
                                            }
                                            var html = "<div class='a-multiple-select' id='" + id + "'>";
                                            if (options['add-add-label'] === undefined)
                                            {
                                              options['add-add-label'] = 'Add';
                                            }
                                            if (autocomplete)
                                            {
                                              html += '<div class="a-autocomplete">\n';
                                              html += "<input type='text' />";
                                              html += '</div>\n';
                                            }
                                            else
                                            {
                                              html += "<select class='a-multiple-select-input' ";
                                              html += "name='select-" + name + "'></select>\n";
                                            }
                                            if (addIndex !== undefined)
                                            {
                                              if (options['add-cancel-label'] === undefined)
                                              {
                                                options['add-cancel-label'] = 'Cancel';
                                              }
                                              html += '<div class="add" style="display: none">\n';
                                              html += '<input name="add-text" class="add-text" type="text">\n';
                                              html += '<a href="#add" onclick="return false;" class="add-add a-btn icon a-add"><span class="icon"></span>' + options['add-add-label'] + '</a>\n';
                                              html += '<a href="#cancel" onclick="return false;" class="a-btn icon a-cancel add-cancel no-label"><span class="icon"></span>' + options['add-cancel-label'] + '</a>\n';
                                              html += '</div>\n';
                                            }
                                            for (j = 0; (j < length); j++)
                                            {
                                              html += "<input type='checkbox' name='" + name + "'";
                                              if (options['class-name'] !== undefined)
                                              {
                                                html += "class='" + options['class-name'] + "'";
                                              }
                                              if (selected[j])
                                              {
                                                html += " checked";
                                              }
                                              html += " value=\"" + aHtmlEscape(values[j]) + "\" style='display: none'/>";
                                            }
                                            html += "<ul class='a-ui a-multiple-select-list'>";
                                            if (!options['remove'])
                                            {
                                              options['remove'] = ' <span class="icon"></span><span>Remove</span>';
                                            }
                                            for (j = 0; (j < length); j++)
                                            {
                                              html += liHtml(labels[j], options);
                                            }
                                            html += "</ul>\n";
                                            html += "<div class='a-multiple-select-after'></div>\n";
                                            html += "</div>\n";
                                            $(this).replaceWith(html);
                                            var container = $('#' + id);
                                            container.find('.add-cancel').click(function ()
                                                                                {
                                                                                  container.find('.add').hide();
                                                                                  return false;
                                                                                });
                                            container.find('.add-add').click(function ()
                                                                             {
                                                                               doSaveAdd();
                                                                             });
                                            container.find('.add-text').keypress(function (event)
                                                                                 {
                                                                                   if (event.keyCode == '13')
                                                                                   {
                                                                                     event.preventDefault();
                                                                                     doSaveAdd();
                                                                                   }
                                                                                   ;
                                                                                 });
                                            function doSaveAdd()
                                            {
                                              container.find('.add').hide();
                                              var addText = container.find('.add-text');
                                              var v = addText.val();
                                              addText.val('');
                                              var ev = aHtmlEscape(v);
                                              if (v.length && (!containsLabel(v)))
                                              {
                                                container.append("<input type='checkbox' name='" + addName + "' value='" + ev + "' style='display: none' checked />");
                                                var remover = $(liHtml(v, options));
                                                remover.click(function ()
                                                              {
                                                                container.find('input[type=checkbox]').filter(function ()
                                                                                                              {
                                                                                                                return $(this).val() === ev
                                                                                                              }).remove();
                                                                $(this).remove();
                                                                onChange();
                                                                return false;
                                                              });
                                                container.find('ul').append(remover);
                                                remover.show();
                                                onChange();
                                              }
                                              return false;
                                            }

                                            var select = $("#" + id + " select");
                                            var k;
                                            var items = $('#' + id + ' ul li');
                                            for (k = 0; (k < length); k++)
                                            {
                                              $(items[k]).data("boxid", values[k]);
                                              $(items[k]).click(function ()
                                                                {
                                                                  update($(this).data("boxid"), false);
                                                                  return false;
                                                                });
                                            }
                                            var autocompleteText = container.find('.a-autocomplete').find('input[type=text]');
                                            autocompleteText.autocomplete({
                                                                            source: autocomplete, focus: function (event, ui)
                                              {
                                                autocompleteText.val(ui.item.label);
                                                return false;
                                              }, select: function (event, ui)
                                              {
                                                apostrophe.log('select');
                                                autocompleteText.val('');
                                                if (!container.find('input[type=checkbox]').filter(function ()
                                                                                                   {
                                                                                                     return $(this).val() === String(ui.item.value)
                                                                                                   }).length)
                                                {
                                                  var newBox = $('<input type="checkbox" />');
                                                  newBox[0].style.display = 'none';
                                                  newBox.attr('name', name);
                                                  newBox.val(ui.item.value);
                                                  container.append(newBox);
                                                  var li = $(liHtml(ui.item.label, options));
                                                  li.data("boxid", String(ui.item.value));
                                                  li.click(function ()
                                                           {
                                                             update($(this).data("boxid"), false);
                                                             return false;
                                                           });
                                                  container.find('ul').append(li);
                                                }
                                                update(false, false, String(ui.item.value));
                                                return false;
                                              }
                                                                          });
                                            function update(remove, initial, add)
                                            {
                                              var value = false;
                                              if (add !== undefined)
                                              {
                                                value = add;
                                              }
                                              var ul = $("#" + id + " ul");
                                              if (!autocomplete)
                                              {
                                                var select = $("#" + id + " select")[0];
                                                var index = select.selectedIndex;
                                              }
                                              if (!autocomplete)
                                              {
                                                if (index > 0)
                                                {
                                                  if ((index === select.length - 1) && options['add'])
                                                  {
                                                    select.selectedIndex = 0;
                                                    $("#" + id + " .add").fadeIn().children('input').focus();
                                                    return;
                                                  }
                                                  value = select.options[index].value;
                                                }
                                              }
                                              var boxes = $('#' + id + " input[type=checkbox]");
                                              boxes.each(function ()
                                                         {
                                                           if ($(this).val() === remove)
                                                           {
                                                             $(this).attr('checked', false);
                                                           }
                                                           else if ($(this).val() === value)
                                                           {
                                                             $(this).attr('checked', true);
                                                           }
                                                         });
                                              var items = $('#' + id + ' ul li');
                                              var k;
                                              var html;
                                              if (autocomplete)
                                              {
                                                length = items.length;
                                              }
                                              for (k = 0; (k < length); k++)
                                              {
                                                if ($(boxes[k]).is(':checked'))
                                                {
                                                  $(items[k]).show();
                                                }
                                                else
                                                {
                                                  $(items[k]).hide();
                                                  if (!autocomplete)
                                                  {
                                                    html += "<option ";
                                                    if (k == 0)
                                                    {
                                                      html += " selected ";
                                                    }
                                                    html += "value=\"" + aHtmlEscape(values[k]) + "\">" +
                                                    labels[k] + "</option>";
                                                  }
                                                }
                                              }
                                              if (addIndex !== undefined)
                                              {
                                                html += "<option value=\"_new\">" + labels[addIndex] + "</option>";
                                              }
                                              if (!autocomplete)
                                              {
                                                $(select).replaceWith("<select class='a-multiple-select-input' name='select-" + name + "'>" + html + "</select>");
                                                $("#" + id + " select").change(function ()
                                                                               {
                                                                                 update(false, false);
                                                                               });
                                              }
                                              if (!initial)
                                              {
                                                onChange();
                                              }
                                            }

                                            function onChange()
                                            {
                                              if (options['onChange'])
                                              {
                                                var div = $('#' + id);
                                                options['onChange'](div, div.parents('form'));
                                              }
                                            }

                                            function aHtmlEscape(html)
                                            {
                                              html = html.replace('&', '&amp;');
                                              html = html.replace('<', '&lt;');
                                              html = html.replace('>', '&gt;');
                                              html = html.replace('"', '&quot;');
                                              html = html.replace("'", '&#39;');
                                              return html;
                                            }

                                            function liHtml(label, options)
                                            {
                                              return '<li class="a-multiple-select-item" style="display: none;"><a href="#" class="a-link icon icon-right a-close-small alt" title="Remove ' + label + '"><span class="label">' + label + '</span><span class="icon">' + options['remove'] + '</span></a></li>\n';
                                            }

                                            function containsLabel(v)
                                            {
                                              var container = $('#' + id);
                                              if (labels.indexOf(v) !== -1)
                                              {
                                                return true;
                                              }
                                              var found = false;
                                              $(container).find('input[type=checkbox]').each(function ()
                                                                                             {
                                                                                               if ($(this).val() === v)
                                                                                               {
                                                                                                 found = true;
                                                                                               }
                                                                                             });
                                              return found;
                                            }

                                            update(false, true);
                                          });
}
function aRadioSelect(target, options)
{
  $(target).each(function (i)
                 {
                   if ($(this).data('a-radio-select-applied'))
                   {
                     return;
                   }
                   $(this).hide();
                   $(this).data('a-radio-select-applied', 1);
                   var html = "";
                   var links = "";
                   var j;
                   var total = this.options.length;
                   linkTemplate = getOption("linkTemplate", "<a href='#'>_LABEL_</a>");
                   spanTemplate = getOption("spanTemplate", "<span class='a-radio-select-container'>_LINKS_</span>");
                   betweenLinks = getOption("betweenLinks", " ");
                   autoSubmit = getOption("autoSubmit", false);
                   for (j = 0; (j < this.options.length); j++)
                   {
                     if (j > 0)
                     {
                       links += betweenLinks;
                     }
                     links += linkTemplate.replace("_LABEL_", $(this.options[j]).html());
                   }
                   span = $(spanTemplate.replace("_LINKS_", links));
                   var select = this;
                   links = span.find('a');
                   $(links[select.selectedIndex]).addClass('a-radio-option-selected');
                   links.each(function (j)
                              {
                                $(this).data("aIndex", j);
                                $(this).addClass('option-' + j);
                                if (j == 0)
                                {
                                  $(this).addClass('first');
                                }
                                if (j == total - 1)
                                {
                                  $(this).addClass('last');
                                }
                                $(this).click(function (e)
                                              {
                                                select.selectedIndex = $(this).data("aIndex");
                                                var parent = ($(this).parent());
                                                parent.find('a').removeClass('a-radio-option-selected');
                                                $(this).addClass('a-radio-option-selected');
                                                if (autoSubmit)
                                                {
                                                  select.form.submit();
                                                }
                                                return false;
                                              });
                              });
                   $(this).after(span);
                   function getOption(name, def)
                   {
                     if (name in options)
                     {
                       return options[name];
                     }
                     else
                     {
                       return def;
                     }
                   }
                 });
}
function aSelectToList(selector, options)
{
  $(selector).each(function (i)
                   {
                     $(this).hide();
                     var total = this.options.length;
                     var html = "<ul>";
                     var selectElement = this;
                     var tags = options['tags'];
                     var popular = false;
                     var alpha = false;
                     var all = true;
                     var itemTemplate = options['itemTemplate'];
                     if (!itemTemplate)
                     {
                       if (tags)
                       {
                         itemTemplate = "_LABEL_ <span class='a-tag-count'>_COUNT_";
                       }
                       else
                       {
                         itemTemplate = "_LABEL_";
                       }
                     }
                     var currentTemplate;
                     if (tags)
                     {
                       popular = options['popular'];
                       all = options['all'];
                       alpha = options['alpha'];
                     }
                     if (options['currentTemplate'])
                     {
                       currentTemplate = options['currentTemplate'];
                     }
                     else
                     {
                       currentTemplate = "<h5>_LABEL_ <a href='#'><font color='red'><i>x</i></font></a></h5>";
                     }
                     var data = [];
                     var re = /^(.*)?\s+\((\d+)\)\s*$/;
                     index = -1;
                     for (i = 0; (i < total); i++)
                     {
                       var html = this.options[i].innerHTML;
                       if (tags)
                       {
                         var result = re.exec(html);
                         if (result)
                         {
                           data.push({label: result[1], count: result[2], value: this.options[i].value});
                         }
                         else
                         {
                           continue;
                         }
                       }
                       else
                       {
                         if ((this.options[i].value + '') !== '')
                         {
                           data.push({label: html, value: this.options[i].value});
                         }
                         else
                         {
                           continue;
                         }
                       }
                       if (selectElement.selectedIndex == i)
                       {
                         index = data.length - 1;
                       }
                     }
                     if (all)
                     {
                       var sorted = data.slice();
                       if (alpha)
                       {
                         sorted = sorted.sort(sortItemsAlpha);
                       }
                       var lclass = options['listAllClass'];
                       var allList = appendList(sorted, lclass);
                       if (!options['allVisible'])
                       {
                         allList.hide();
                       }
                       if (options['allLabel'])
                       {
                         var allLabel = $(options['allLabel']);
                         if (allLabel)
                         {
                           var a = allLabel.find('a');
                           if (a)
                           {
                             a.click(function ()
                                     {
                                       allList.toggle("slow");
                                       return false;
                                     });
                           }
                         }
                         $(selectElement).after(allLabel);
                       }
                     }
                     if (popular)
                     {
                       var sorted = data.slice();
                       sorted = sorted.sort(sortItemsPopular);
                       sorted = sorted.slice(0, popular);
                       appendList(sorted, options['listPopularClass']);
                       if (options['popularLabel'])
                       {
                         $(selectElement).after($(options['popularLabel']));
                       }
                     }
                     if (index >= 0)
                     {
                       var current = currentTemplate;
                       current = current.replace("_LABEL_", data[index].label);
                       current = current.replace("_COUNT_", data[index].count);
                       current = $(current);
                       var a = current.find('a');
                       a.click(function ()
                               {
                                 selectElement.selectedIndex = 0;
                                 $(selectElement.form).submit();
                                 return false;
                               });
                       $(selectElement).after(current);
                     }
                     function appendList(data, c)
                     {
                       var list = $('<ul></ul>');
                       if (c)
                       {
                         list.addClass(c);
                       }
                       for (i = 0; (i < data.length); i++)
                       {
                         var item = itemTemplate;
                         if (tags)
                         {
                           item = item.replace("_COUNT_", data[i].count);
                         }
                         item = item.replace("_LABEL_", data[i].label);
                         var liHtml = "<li><a href='#'>" + item + "</a></li>";
                         var li = $(liHtml);
                         var a = li.find('a');
                         a.data('label', data[i].label);
                         a.data('value', data[i].value);
                         a.click(function ()
                                 {
                                   $(selectElement).val($(this).data('value'));
                                   $(selectElement.form).submit();
                                   return false;
                                 });
                         list.append(li);
                       }
                       $(selectElement).after(list);
                       return list;
                     }
                   });
  function sortItemsAlpha(a, b)
  {
    x = a.label.toLowerCase();
    y = b.label.toLowerCase();
    return x > y ? 1 : x < y ? -1 : 0;
  }

  function sortItemsPopular(a, b)
  {
    return b.count - a.count;
  }
}
function aInputSelfLabel(selector, label, select, focus, persistentLabel)
{
  var aInput = $(selector);
  aInput.each(function ()
              {
                setLabelIfNeeded(this);
                $(this).addClass('a-default-value');
              });
  if (focus)
  {
    aInput.focus();
  }
  ;
  aInput.focus(function ()
               {
                 var v = $(this).val();
                 if (v === label)
                 {
                   if (select)
                   {
                     aInput.select();
                   }
                   else
                   {
                     if (persistentLabel)
                     {
                       aInput.aSetCursorPosition(0);
                     }
                     else
                     {
                       clearLabelIfNeeded(this);
                     }
                     ;
                   }
                 }
                 ;
               });
  aInput.keydown(function ()
                 {
                   clearLabelIfNeeded(this);
                 });
  aInput.blur(function ()
              {
                setLabelIfNeeded(this);
              });
  function setLabelIfNeeded(e)
  {
    var v = $(e).val();
    if (v === '')
    {
      $(e).val(label).addClass('a-default-value');
    }
  }

  function clearLabelIfNeeded(e)
  {
    var v = $(e).val();
    if (v === label)
    {
      $(e).val('').removeClass('a-default-value');
    }
  }
}
function aCheckboxEnables(boxSelector, enablesItemsSelector, showsItemsSelector, disablesItemsSelector, hidesItemsSelector)
{
  $(boxSelector).data('aCheckboxEnablesSelectors', [enablesItemsSelector, showsItemsSelector, disablesItemsSelector, hidesItemsSelector]);
  $(boxSelector).click(function ()
                       {
                         update(this);
                       });
  function bumpEnabled(selector, show)
  {
    if (selector === undefined)
    {
      return;
    }
    $(selector).each(function ()
                     {
                       var counter = $(this).data('aCheckboxEnablesEnableCounter');
                       if (counter < 0)
                       {
                         counter++;
                         $(this).data('aCheckboxEnablesEnableCounter', counter);
                       }
                       if (counter >= 0)
                       {
                         if (show)
                         {
                           $(this).show();
                         }
                         else
                         {
                           $(this).removeAttr('disabled');
                         }
                       }
                     });
  }

  function bumpDisabled(selector, hide)
  {
    if (selector === undefined)
    {
      return;
    }
    $(selector).each(function ()
                     {
                       var counter = $(this).data('aCheckboxEnablesEnableCounter');
                       if (counter === undefined)
                       {
                         counter = 0;
                       }
                       counter--;
                       $(this).data('aCheckboxEnablesEnableCounter', counter);
                       if (hide)
                       {
                         $(this).hide();
                       }
                       else
                       {
                         $(this).attr('disabled', 'disabled');
                       }
                     });
  }

  function update(checkbox)
  {
    var selectors = $(checkbox).data('aCheckboxEnablesSelectors');
    var checked = $(checkbox).attr('checked');
    if (checked)
    {
      bumpEnabled(selectors[0], false);
      bumpEnabled(selectors[1], true);
      bumpDisabled(selectors[2], false);
      bumpDisabled(selectors[3], true);
    }
    else
    {
      bumpDisabled(selectors[0], false);
      bumpDisabled(selectors[1], true);
      bumpEnabled(selectors[2], false);
      bumpEnabled(selectors[3], true);
    }
  }

  $(function ()
    {
      $(boxSelector).each(function ()
                          {
                            update(this)
                          });
    });
}
function aSelectEnables(selectSelector, itemsSelectors, hideItemsSelectors)
{
  $(selectSelector).data('aSelectEnablesItemsSelectors', itemsSelectors);
  $(selectSelector).data('aSelectEnablesHideItemsSelectors', hideItemsSelectors);
  $(selectSelector).change(function ()
                           {
                             update(this);
                           });
  function update(select)
  {
    var itemsSelectors = $(select).data('aSelectEnablesItemsSelectors');
    var hideItemsSelectors = $(select).data('aSelectEnablesHideItemsSelectors');
    if (itemsSelectors !== undefined)
    {
      for (var option in itemsSelectors)
      {
        $(itemsSelectors[option]).attr('disabled', 'disabled');
      }
      var option = select.value;
      if (itemsSelectors[option])
      {
        $(itemsSelectors[option]).removeAttr('disabled');
      }
    }
    if (hideItemsSelectors !== undefined)
    {
      for (var option in hideItemsSelectors)
      {
        $(hideItemsSelectors[option]).hide();
      }
      var option = select.value;
      if (hideItemsSelectors[option])
      {
        $(hideItemsSelectors[option]).show();
      }
    }
  }

  $(function ()
    {
      $(selectSelector).each(function ()
                             {
                               update(this)
                             });
    });
}
function aBusy(selector)
{
  $(selector).each(function ()
                   {
                     $(this).data('a-busy-html', $(this).html());
                     $(this).html("<img src=\"/apostrophePlugin/images/a-icon-loader-2.gif\"/>");
                   });
}
function aReady(selector)
{
  $(selector).each(function ()
                   {
                     $(this).html($(this).data('a-busy-html'));
                   });
}
function aSelectToStatic(selector)
{
  $(selector).find('select').each(function ()
                                  {
                                    if ((this.options.length == 1) && (this.options[0].selected))
                                    {
                                      $(this).after('<span class="a-static-select">' + this.options[0].innerHTML + '</span>');
                                      $(this).hide();
                                    }
                                  });
}
new function ($)
{
  $.fn.aSetCursorPosition = function (pos)
  {
    var $this = $(this).get(0);
    if ($this.setSelectionRange)
    {
      $this.setSelectionRange(pos, pos);
    }
    else if ($this.createTextRange)
    {
      var range = $this.createTextRange();
      range.collapse(true);
      range.moveEnd('character', pos);
      range.moveStart('character', pos);
      range.select();
    }
  }
}(jQuery);
new function ($)
{
  $.fn.aRemoteSubmit = function (update)
  {
    var rBtn = $(this);
    rBtn.click(function (event)
               {
                 event.preventDefault();
                 var rForm = rBtn.closest('form');
                 var rFormURL = rForm.attr('action');
                 $.ajax({
                          type: 'POST', url: rFormURL, dataType: 'html', data: rForm.serialize(), success: function (data)
                   {
                     $(update).html(data);
                   }
                        });
               });
  };
}(jQuery);
new function ($)
{
  $.fn.isChildOf = function (b)
  {
    return (this.parents(b).length > 0);
  };
}(jQuery);
if (!this.JSON)
{
  this.JSON = {};
}
(function ()
{
  function f(n)
  {
    return n < 10 ? '0' + n : n;
  }

  if (typeof Date.prototype.toJSON !== 'function')
  {
    Date.prototype.toJSON = function (key)
    {
      return isFinite(this.valueOf()) ? this.getUTCFullYear() + '-' +
      f(this.getUTCMonth() + 1) + '-' +
      f(this.getUTCDate()) + 'T' +
      f(this.getUTCHours()) + ':' +
      f(this.getUTCMinutes()) + ':' +
      f(this.getUTCSeconds()) + 'Z' : null;
    };
    String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function (key)
    {
      return this.valueOf();
    };
  }
  var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, gap, indent, meta = {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '"': '\\"',
    '\\': '\\\\'
  }, rep;

  function quote(string)
  {
    escapable.lastIndex = 0;
    return escapable.test(string) ? '"' + string.replace(escapable, function (a)
    {
      var c = meta[a];
      return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
    }) + '"' : '"' + string + '"';
  }

  function str(key, holder)
  {
    var i, k, v, length, mind = gap, partial, value = holder[key];
    if (value && typeof value === 'object' && typeof value.toJSON === 'function')
    {
      value = value.toJSON(key);
    }
    if (typeof rep === 'function')
    {
      value = rep.call(holder, key, value);
    }
    switch (typeof value)
    {
      case'string':
        return quote(value);
      case'number':
        return isFinite(value) ? String(value) : 'null';
      case'boolean':
      case'null':
        return String(value);
      case'object':
        if (!value)
        {
          return 'null';
        }
        gap += indent;
        partial = [];
        if (Object.prototype.toString.apply(value) === '[object Array]')
        {
          length = value.length;
          for (i = 0; i < length; i += 1)
          {
            partial[i] = str(i, value) || 'null';
          }
          v = partial.length === 0 ? '[]' : gap ? '[\n' + gap +
          partial.join(',\n' + gap) + '\n' +
          mind + ']' : '[' + partial.join(',') + ']';
          gap = mind;
          return v;
        }
        if (rep && typeof rep === 'object')
        {
          length = rep.length;
          for (i = 0; i < length; i += 1)
          {
            k = rep[i];
            if (typeof k === 'string')
            {
              v = str(k, value);
              if (v)
              {
                partial.push(quote(k) + (gap ? ': ' : ':') + v);
              }
            }
          }
        }
        else
        {
          for (k in value)
          {
            if (Object.hasOwnProperty.call(value, k))
            {
              v = str(k, value);
              if (v)
              {
                partial.push(quote(k) + (gap ? ': ' : ':') + v);
              }
            }
          }
        }
        v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
        mind + '}' : '{' + partial.join(',') + '}';
        gap = mind;
        return v;
    }
  }

  if (typeof JSON.stringify !== 'function')
  {
    JSON.stringify = function (value, replacer, space)
    {
      var i;
      gap = '';
      indent = '';
      if (typeof space === 'number')
      {
        for (i = 0; i < space; i += 1)
        {
          indent += ' ';
        }
      }
      else if (typeof space === 'string')
      {
        indent = space;
      }
      rep = replacer;
      if (replacer && typeof replacer !== 'function' && (typeof replacer !== 'object' || typeof replacer.length !== 'number'))
      {
        throw new Error('JSON.stringify');
      }
      return str('', {'': value});
    };
  }
  if (typeof JSON.parse !== 'function')
  {
    JSON.parse = function (text, reviver)
    {
      var j;

      function walk(holder, key)
      {
        var k, v, value = holder[key];
        if (value && typeof value === 'object')
        {
          for (k in value)
          {
            if (Object.hasOwnProperty.call(value, k))
            {
              v = walk(value, k);
              if (v !== undefined)
              {
                value[k] = v;
              }
              else
              {
                delete value[k];
              }
            }
          }
        }
        return reviver.call(holder, key, value);
      }

      text = String(text);
      cx.lastIndex = 0;
      if (cx.test(text))
      {
        text = text.replace(cx, function (a)
        {
          return '\\u' +
            ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        });
      }
      if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, '')))
      {
        j = eval('(' + text + ')');
        return typeof reviver === 'function' ? walk({'': j}, '') : j;
      }
      throw new SyntaxError('JSON.parse');
    };
  }
}());
(function (jQuery)
{
  jQuery.fn.simpleautogrow = function ()
  {
    return this.each(function ()
                     {
                       new jQuery.simpleautogrow(this);
                     });
  };
  jQuery.simpleautogrow = function (e)
  {
    var self = this;
    var $e = this.textarea = jQuery(e).css({overflow: 'hidden', display: 'block'}).bind('focus', function ()
    {
      this.timer = window.setInterval(function ()
                                      {
                                        self.checkExpand();
                                      }, 200);
    }).bind('blur', function ()
    {
      clearInterval(this.timer);
    });
    this.border = $e.outerHeight() - $e.innerHeight();
    this.clone = $e.clone().css({position: 'absolute', visibility: 'hidden'}).attr('name', '')
    $e.height(e.scrollHeight + this.border).after(this.clone);
    this.checkExpand();
  };
  jQuery.simpleautogrow.prototype.checkExpand = function ()
  {
    var target_height = this.clone[0].scrollHeight + this.border;
    if (this.textarea.outerHeight() != target_height)
    {
      this.textarea.height(target_height + 'px');
    }
    this.clone.attr('value', this.textarea.attr('value')).height(0);
  };
})(jQuery);
(function ($)
{
  $.fn.hoverIntent = function (f, g)
  {
    var cfg = {sensitivity: 12, interval: 350, timeout: 0};
    cfg = $.extend(cfg, g ? {over: f, out: g} : f);
    var cX, cY, pX, pY;
    var track = function (ev)
    {
      cX = ev.pageX;
      cY = ev.pageY;
    };
    var compare = function (ev, ob)
    {
      ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
      if ((Math.abs(pX - cX) + Math.abs(pY - cY)) < cfg.sensitivity)
      {
        $(ob).unbind("mousemove", track);
        ob.hoverIntent_s = 1;
        return cfg.over.apply(ob, [ev]);
      }
      else
      {
        pX = cX;
        pY = cY;
        ob.hoverIntent_t = setTimeout(function ()
                                      {
                                        compare(ev, ob);
                                      }, cfg.interval);
      }
    };
    var delay = function (ev, ob)
    {
      ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
      ob.hoverIntent_s = 0;
      return cfg.out.apply(ob, [ev]);
    };
    var handleHover = function (e)
    {
      var p = (e.type == "mouseover" ? e.fromElement : e.toElement) || e.relatedTarget;
      while (p && p != this)
      {
        try
        {
          p = p.parentNode;
        }
        catch (e)
        {
          p = this;
        }
      }
      if (p == this)
      {
        return false;
      }
      var ev = jQuery.extend({}, e);
      var ob = this;
      if (ob.hoverIntent_t)
      {
        ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
      }
      if (e.type == "mouseover")
      {
        pX = ev.pageX;
        pY = ev.pageY;
        $(ob).bind("mousemove", track);
        if (ob.hoverIntent_s != 1)
        {
          ob.hoverIntent_t = setTimeout(function ()
                                        {
                                          compare(ev, ob);
                                        }, cfg.interval);
        }
      }
      else
      {
        $(ob).unbind("mousemove", track);
        if (ob.hoverIntent_s == 1)
        {
          ob.hoverIntent_t = setTimeout(function ()
                                        {
                                          delay(ev, ob);
                                        }, cfg.timeout);
        }
      }
    };
    return this.mouseover(handleHover).mouseout(handleHover);
  };
})(jQuery);
;
(function (d)
{
  var k = d.scrollTo = function (a, i, e)
  {
    d(window).scrollTo(a, i, e)
  };
  k.defaults = {axis: 'xy', duration: parseFloat(d.fn.jquery) >= 1.3 ? 0 : 1};
  k.window = function (a)
  {
    return d(window)._scrollable()
  };
  d.fn._scrollable = function ()
  {
    return this.map(function ()
                    {
                      var a = this, i = !a.nodeName || d.inArray(a.nodeName.toLowerCase(), ['iframe', '#document', 'html', 'body']) != -1;
                      if (!i)
                      {
                        return a;
                      }
                      var e = (a.contentWindow || a).document || a.ownerDocument || a;
                      return d.browser.safari || e.compatMode == 'BackCompat' ? e.body : e.documentElement
                    })
  };
  d.fn.scrollTo = function (n, j, b)
  {
    if (typeof j == 'object')
    {
      b = j;
      j = 0
    }
    if (typeof b == 'function')
    {
      b = {onAfter: b};
    }
    if (n == 'max')
    {
      n = 9e9;
    }
    b = d.extend({}, k.defaults, b);
    j = j || b.speed || b.duration;
    b.queue = b.queue && b.axis.length > 1;
    if (b.queue)
    {
      j /= 2;
    }
    b.offset = p(b.offset);
    b.over = p(b.over);
    return this._scrollable().each(function ()
                                   {
                                     var q = this, r = d(q), f = n, s, g = {}, u = r.is('html,body');
                                     switch (typeof f)
                                     {
                                       case'number':
                                       case'string':
                                         if (/^([+-]=)?\d+(\.\d+)?(px|%)?$/.test(f))
                                         {
                                           f = p(f);
                                           break
                                         }
                                         f = d(f, this);
                                       case'object':
                                         if (f.is || f.style)
                                         {
                                           s = (f = d(f)).offset()
                                         }
                                     }
                                     d.each(b.axis.split(''), function (a, i)
                                     {
                                       var e = i == 'x' ? 'Left' : 'Top', h = e.toLowerCase(), c = 'scroll' + e, l = q[c], m = k.max(q, i);
                                       if (s)
                                       {
                                         g[c] = s[h] + (u ? 0 : l - r.offset()[h]);
                                         if (b.margin)
                                         {
                                           g[c] -= parseInt(f.css('margin' + e)) || 0;
                                           g[c] -= parseInt(f.css('border' + e + 'Width')) || 0
                                         }
                                         g[c] += b.offset[h] || 0;
                                         if (b.over[h])
                                         {
                                           g[c] += f[i == 'x' ? 'width' : 'height']() * b.over[h]
                                         }
                                       }
                                       else
                                       {
                                         var o = f[h];
                                         g[c] = o.slice && o.slice(-1) == '%' ? parseFloat(o) / 100 * m : o
                                       }
                                       if (/^\d+$/.test(g[c]))
                                       {
                                         g[c] = g[c] <= 0 ? 0 : Math.min(g[c], m);
                                       }
                                       if (!a && b.queue)
                                       {
                                         if (l != g[c])
                                         {
                                           t(b.onAfterFirst);
                                         }
                                         delete g[c]
                                       }
                                     });
                                     t(b.onAfter);
                                     function t(a)
                                     {
                                       r.animate(g, j, b.easing, a && function ()
                                       {
                                         a.call(this, n, b)
                                       })
                                     }
                                   }).end()
  };
  k.max = function (a, i)
  {
    var e = i == 'x' ? 'Width' : 'Height', h = 'scroll' + e;
    if (!d(a).is('html,body'))
    {
      return a[h] - d(a)[e.toLowerCase()]();
    }
    var c = 'client' + e, l = a.ownerDocument.documentElement, m = a.ownerDocument.body;
    return Math.max(l[h], m[h]) - Math.min(l[c], m[c])
  };
  function p(a)
  {
    return typeof a == 'object' ? a : {top: a, left: a}
  }
})(jQuery);
(function ($)
{
  function getter(plugin, method, args)
  {
    function getMethods(type)
    {
      var methods = $[plugin][type] || [];
      return (typeof methods == 'string' ? methods.split(/,?\s+/) : methods);
    }

    var methods = getMethods('getter');
    return ($.inArray(method, methods) != -1);
  }

  $.fn.jPlayer = function (options)
  {
    var name = "jPlayer";
    var isMethodCall = (typeof options == 'string');
    var args = Array.prototype.slice.call(arguments, 1);
    if (isMethodCall && options.substring(0, 1) == '_')
    {
      return this;
    }
    if (isMethodCall && getter(name, options, args))
    {
      var instance = $.data(this[0], name);
      return (instance ? instance[options].apply(instance, args) : undefined);
    }
    return this.each(function ()
                     {
                       var instance = $.data(this, name);
                       if (!instance && !isMethodCall)
                       {
                         $.data(this, name, new $[name](this, options))._init();
                       }
                       (instance && isMethodCall && $.isFunction(instance[options]) && instance[options].apply(instance, args));
                     });
  };
  $.jPlayer = function (element, options)
  {
    this.options = $.extend({}, options);
    this.element = $(element);
  };
  $.jPlayer.getter = "jPlayerOnProgressChange jPlayerOnSoundComplete jPlayerVolume jPlayerReady getData jPlayerController";
  $.jPlayer.defaults = {
    cssPrefix: "jqjp",
    swfPath: "js",
    volume: 80,
    oggSupport: false,
    nativeSupport: true,
    preload: 'none',
    customCssIds: false,
    graphicsFix: true,
    errorAlerts: false,
    warningAlerts: false,
    position: "absolute",
    width: "0",
    height: "0",
    top: "0",
    left: "0",
    quality: "high",
    bgcolor: "#ffffff"
  };
  $.jPlayer._config = {
    version: "1.2.0",
    swfVersionRequired: "1.2.0",
    swfVersion: "unknown",
    jPlayerControllerId: undefined,
    delayedCommandId: undefined,
    isWaitingForPlay: false,
    isFileSet: false
  };
  $.jPlayer._diag = {
    isPlaying: false,
    src: "",
    loadPercent: 0,
    playedPercentRelative: 0,
    playedPercentAbsolute: 0,
    playedTime: 0,
    totalTime: 0
  };
  $.jPlayer._cssId = {
    play: "jplayer_play",
    pause: "jplayer_pause",
    stop: "jplayer_stop",
    loadBar: "jplayer_load_bar",
    playBar: "jplayer_play_bar",
    volumeMin: "jplayer_volume_min",
    volumeMax: "jplayer_volume_max",
    volumeBar: "jplayer_volume_bar",
    volumeBarValue: "jplayer_volume_bar_value"
  };
  $.jPlayer.count = 0;
  $.jPlayer.timeFormat = {
    showHour: false,
    showMin: true,
    showSec: true,
    padHour: false,
    padMin: true,
    padSec: true,
    sepHour: ":",
    sepMin: ":",
    sepSec: ""
  };
  $.jPlayer.convertTime = function (mSec)
  {
    var myTime = new Date(mSec);
    var hour = myTime.getUTCHours();
    var min = myTime.getUTCMinutes();
    var sec = myTime.getUTCSeconds();
    var strHour = ($.jPlayer.timeFormat.padHour && hour < 10) ? "0" + hour : hour;
    var strMin = ($.jPlayer.timeFormat.padMin && min < 10) ? "0" + min : min;
    var strSec = ($.jPlayer.timeFormat.padSec && sec < 10) ? "0" + sec : sec;
    return (($.jPlayer.timeFormat.showHour) ? strHour + $.jPlayer.timeFormat.sepHour : "") + (($.jPlayer.timeFormat.showMin) ? strMin + $.jPlayer.timeFormat.sepMin : "") + (($.jPlayer.timeFormat.showSec) ? strSec + $.jPlayer.timeFormat.sepSec : "");
  };
  $.jPlayer.prototype = {
    _init: function ()
    {
      var self = this;
      var element = this.element;
      this.config = $.extend({}, $.jPlayer.defaults, this.options, $.jPlayer._config);
      this.config.diag = $.extend({}, $.jPlayer._diag);
      this.config.cssId = {};
      this.config.cssSelector = {};
      this.config.cssDisplay = {};
      this.config.clickHandler = {};
      this.element.data("jPlayer.config", this.config);
      $.extend(this.config, {
        id: this.element.attr("id"),
        swf: this.config.swfPath + ((this.config.swfPath != "" && this.config.swfPath.slice(-1) != "/") ? "/" : "") + "Jplayer.swf",
        fid: this.config.cssPrefix + "_flash_" + $.jPlayer.count,
        aid: this.config.cssPrefix + "_audio_" + $.jPlayer.count,
        hid: this.config.cssPrefix + "_force_" + $.jPlayer.count,
        i: $.jPlayer.count,
        volume: this._limitValue(this.config.volume, 0, 100),
        autobuffer: this.config.preload != 'none'
      });
      $.jPlayer.count++;
      if (this.config.ready != undefined)
      {
        if ($.isFunction(this.config.ready))
        {
          this.jPlayerReadyCustom = this.config.ready;
        }
        else
        {
          this._warning("Constructor's ready option is not a function.");
        }
      }
      this.config.audio = document.createElement('audio');
      this.config.audio.id = this.config.aid;
      $.extend(this.config, {
        canPlayMP3: !!((this.config.audio.canPlayType) ? (("" != this.config.audio.canPlayType("audio/mpeg")) && ("no" != this.config.audio.canPlayType("audio/mpeg"))) : false),
        canPlayOGG: !!((this.config.audio.canPlayType) ? (("" != this.config.audio.canPlayType("audio/ogg")) && ("no" != this.config.audio.canPlayType("audio/ogg"))) : false),
        aSel: $("#" + this.config.aid)
      });
      $.extend(this.config, {html5: !!((this.config.oggSupport) ? ((this.config.canPlayOGG) ? true : this.config.canPlayMP3) : this.config.canPlayMP3)});
      $.extend(this.config, {
        usingFlash: !(this.config.html5 && this.config.nativeSupport),
        usingMP3: !(this.config.oggSupport && this.config.canPlayOGG && this.config.nativeSupport)
      });
      var events = {
        setButtons: function (e, playing)
        {
          self.config.diag.isPlaying = playing;
          if (self.config.cssId.play != undefined && self.config.cssId.pause != undefined)
          {
            if (playing)
            {
              self.config.cssSelector.play.css("display", "none");
              self.config.cssSelector.pause.css("display", self.config.cssDisplay.pause);
            }
            else
            {
              self.config.cssSelector.play.css("display", self.config.cssDisplay.play);
              self.config.cssSelector.pause.css("display", "none");
            }
          }
          if (playing)
          {
            self.config.isWaitingForPlay = false;
          }
        }
      };
      var eventsForFlash = {
        setFile: function (e, mp3, ogg)
        {
          try
          {
            self._getMovie().fl_setFile_mp3(mp3);
            if (self.config.autobuffer)
            {
              element.trigger("jPlayer.load");
            }
            self.config.diag.src = mp3;
            self.config.isFileSet = true;
            element.trigger("jPlayer.setButtons", false);
          }
          catch (err)
          {
            self._flashError(err);
          }
        }, clearFile: function (e)
        {
          try
          {
            element.trigger("jPlayer.setButtons", false);
            self._getMovie().fl_clearFile_mp3();
            self.config.diag.src = "";
            self.config.isFileSet = false;
          }
          catch (err)
          {
            self._flashError(err);
          }
        }, load: function (e)
        {
          try
          {
            self._getMovie().fl_load_mp3();
          }
          catch (err)
          {
            self._flashError(err);
          }
        }, play: function (e)
        {
          try
          {
            if (self._getMovie().fl_play_mp3())
            {
              element.trigger("jPlayer.setButtons", true);
            }
          }
          catch (err)
          {
            self._flashError(err);
          }
        }, pause: function (e)
        {
          try
          {
            if (self._getMovie().fl_pause_mp3())
            {
              element.trigger("jPlayer.setButtons", false);
            }
          }
          catch (err)
          {
            self._flashError(err);
          }
        }, stop: function (e)
        {
          try
          {
            if (self._getMovie().fl_stop_mp3())
            {
              element.trigger("jPlayer.setButtons", false);
            }
          }
          catch (err)
          {
            self._flashError(err);
          }
        }, playHead: function (e, p)
        {
          try
          {
            if (self._getMovie().fl_play_head_mp3(p))
            {
              element.trigger("jPlayer.setButtons", true);
            }
          }
          catch (err)
          {
            self._flashError(err);
          }
        }, playHeadTime: function (e, t)
        {
          try
          {
            if (self._getMovie().fl_play_head_time_mp3(t))
            {
              element.trigger("jPlayer.setButtons", true);
            }
          }
          catch (err)
          {
            self._flashError(err);
          }
        }, volume: function (e, v)
        {
          self.config.volume = v;
          try
          {
            self._getMovie().fl_volume_mp3(v);
          }
          catch (err)
          {
            self._flashError(err);
          }
        }
      };
      var eventsForHtmlAudio = {
        setFile: function (e, mp3, ogg)
        {
          if (self.config.usingMP3)
          {
            self.config.diag.src = mp3;
          }
          else
          {
            self.config.diag.src = ogg;
          }
          if (self.config.isFileSet && !self.config.isWaitingForPlay)
          {
            element.trigger("jPlayer.pause");
          }
          self.config.audio.autobuffer = self.config.autobuffer;
          self.config.audio.preload = self.config.preload;
          if (self.config.autobuffer)
          {
            self.config.audio.src = self.config.diag.src;
            self.config.audio.load();
          }
          else
          {
            self.config.isWaitingForPlay = true;
          }
          self.config.isFileSet = true;
          self.jPlayerOnProgressChange(0, 0, 0, 0, 0);
          clearInterval(self.config.jPlayerControllerId);
          if (self.config.autobuffer)
          {
            self.config.jPlayerControllerId = window.setInterval(function ()
                                                                 {
                                                                   self.jPlayerController(false);
                                                                 }, 100);
          }
          clearInterval(self.config.delayedCommandId);
        }, clearFile: function (e)
        {
          self.setFile("", "");
          self.config.isWaitingForPlay = false;
          self.config.isFileSet = false;
        }, load: function (e)
        {
          if (self.config.isFileSet)
          {
            if (self.config.isWaitingForPlay)
            {
              self.config.audio.autobuffer = true;
              self.config.audio.preload = 'auto';
              self.config.audio.src = self.config.diag.src;
              self.config.audio.load();
              self.config.isWaitingForPlay = false;
              clearInterval(self.config.jPlayerControllerId);
              self.config.jPlayerControllerId = window.setInterval(function ()
                                                                   {
                                                                     self.jPlayerController(false);
                                                                   }, 100);
            }
          }
        }, play: function (e)
        {
          if (self.config.isFileSet)
          {
            if (self.config.isWaitingForPlay)
            {
              self.config.audio.src = self.config.diag.src;
              self.config.audio.load();
            }
            self.config.audio.play();
            element.trigger("jPlayer.setButtons", true);
            clearInterval(self.config.jPlayerControllerId);
            self.config.jPlayerControllerId = window.setInterval(function ()
                                                                 {
                                                                   self.jPlayerController(false);
                                                                 }, 100);
            clearInterval(self.config.delayedCommandId);
          }
        }, pause: function (e)
        {
          if (self.config.isFileSet)
          {
            self.config.audio.pause();
            element.trigger("jPlayer.setButtons", false);
            clearInterval(self.config.delayedCommandId);
          }
        }, stop: function (e)
        {
          if (self.config.isFileSet)
          {
            try
            {
              element.trigger("jPlayer.pause");
              self.config.audio.currentTime = 0;
              clearInterval(self.config.jPlayerControllerId);
              self.config.jPlayerControllerId = window.setInterval(function ()
                                                                   {
                                                                     self.jPlayerController(true);
                                                                   }, 100);
            }
            catch (err)
            {
              clearInterval(self.config.delayedCommandId);
              self.config.delayedCommandId = window.setTimeout(function ()
                                                               {
                                                                 self.stop();
                                                               }, 100);
            }
          }
        }, playHead: function (e, p)
        {
          if (self.config.isFileSet)
          {
            try
            {
              element.trigger("jPlayer.load");
              if ((typeof self.config.audio.buffered == "object") && (self.config.audio.buffered.length > 0))
              {
                self.config.audio.currentTime = p * self.config.audio.buffered.end(self.config.audio.buffered.length - 1) / 100;
              }
              else if (self.config.audio.duration > 0 && !isNaN(self.config.audio.duration))
              {
                self.config.audio.currentTime = p * self.config.audio.duration / 100;
              }
              else
              {
                throw"e";
              }
              element.trigger("jPlayer.play");
            }
            catch (err)
            {
              element.trigger("jPlayer.play");
              element.trigger("jPlayer.pause");
              self.config.delayedCommandId = window.setTimeout(function ()
                                                               {
                                                                 self.playHead(p);
                                                               }, 100);
            }
          }
        }, playHeadTime: function (e, t)
        {
          if (self.config.isFileSet)
          {
            try
            {
              element.trigger("jPlayer.load");
              self.config.audio.currentTime = t / 1000;
              element.trigger("jPlayer.play");
            }
            catch (err)
            {
              element.trigger("jPlayer.play");
              element.trigger("jPlayer.pause");
              self.config.delayedCommandId = window.setTimeout(function ()
                                                               {
                                                                 self.playHeadTime(t);
                                                               }, 100);
            }
          }
        }, volume: function (e, v)
        {
          self.config.volume = v;
          self.config.audio.volume = v / 100;
          self.jPlayerVolume(v);
        }
      };
      if (this.config.usingFlash)
      {
        $.extend(events, eventsForFlash);
      }
      else
      {
        $.extend(events, eventsForHtmlAudio);
      }
      for (var event in events)
      {
        var e = "jPlayer." + event;
        this.element.unbind(e);
        this.element.bind(e, events[event]);
      }
      if (this.config.usingFlash)
      {
        if (this._checkForFlash(8))
        {
          if ($.browser.msie)
          {
            var html_obj = '<object id="' + this.config.fid + '"';
            html_obj += ' classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"';
            html_obj += ' codebase="' + document.URL.substring(0, document.URL.indexOf(':')) + '://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab"';
            html_obj += ' type="application/x-shockwave-flash"';
            html_obj += ' width="' + this.config.width + '" height="' + this.config.height + '">';
            html_obj += '</object>';
            var obj_param = new Array();
            obj_param[0] = '<param name="movie" value="' + this.config.swf + '" />';
            obj_param[1] = '<param name="quality" value="high" />';
            obj_param[2] = '<param name="FlashVars" value="id=' + escape(this.config.id) + '&fid=' + escape(this.config.fid) + '&vol=' + this.config.volume + '" />';
            obj_param[3] = '<param name="allowScriptAccess" value="always" />';
            obj_param[4] = '<param name="bgcolor" value="' + this.config.bgcolor + '" />';
            var ie_dom = document.createElement(html_obj);
            for (var i = 0; i < obj_param.length; i++)
            {
              ie_dom.appendChild(document.createElement(obj_param[i]));
            }
            this.element.html(ie_dom);
          }
          else
          {
            var html_embed = '<embed name="' + this.config.fid + '" id="' + this.config.fid + '" src="' + this.config.swf + '"';
            html_embed += ' width="' + this.config.width + '" height="' + this.config.height + '" bgcolor="' + this.config.bgcolor + '"';
            html_embed += ' quality="high" FlashVars="id=' + escape(this.config.id) + '&fid=' + escape(this.config.fid) + '&vol=' + this.config.volume + '"';
            html_embed += ' allowScriptAccess="always"';
            html_embed += ' type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" />';
            this.element.html(html_embed);
          }
        }
        else
        {
          this.element.html("<p>Flash 8 or above is not installed. <a href='http://get.adobe.com/flashplayer'>Get Flash!</a></p>");
        }
      }
      else
      {
        this.config.audio.autobuffer = this.config.autobuffer;
        this.config.audio.preload = this.config.preload;
        this.config.audio.addEventListener("canplay", function ()
        {
          var rnd = 0.1 * Math.random();
          var fix = (self.config.volume < 50) ? rnd : -rnd;
          self.config.audio.volume = (self.config.volume + fix) / 100;
        }, false);
        this.config.audio.addEventListener("ended", function ()
        {
          clearInterval(self.config.jPlayerControllerId);
          self.jPlayerOnSoundComplete();
        }, false);
        this.element.append(this.config.audio);
      }
      this.element.css({'position': this.config.position, 'top': this.config.top, 'left': this.config.left});
      if (this.config.graphicsFix)
      {
        var html_hidden = '<div id="' + this.config.hid + '"></div>';
        this.element.append(html_hidden);
        $.extend(this.config, {hSel: $("#" + this.config.hid)});
        this.config.hSel.css({'text-indent': '-9999px'});
      }
      if (!this.config.customCssIds)
      {
        $.each($.jPlayer._cssId, function (name, id)
        {
          self.cssId(name, id);
        });
      }
      if (!this.config.usingFlash)
      {
        this.element.css({'left': '-9999px'});
        window.setTimeout(function ()
                          {
                            self.volume(self.config.volume);
                            self.jPlayerReady();
                          }, 100);
      }
    }, jPlayerReady: function (swfVersion)
    {
      if (this.config.usingFlash)
      {
        this.config.swfVersion = swfVersion;
        if (this.config.swfVersionRequired != this.config.swfVersion)
        {
          this._error("jPlayer's JavaScript / SWF version mismatch!\n\nJavaScript requires SWF : " + this.config.swfVersionRequired + "\nThe Jplayer.swf used is : " + this.config.swfVersion);
        }
      }
      else
      {
        this.config.swfVersion = "n/a";
      }
      this.jPlayerReadyCustom();
    }, jPlayerReadyCustom: function ()
    {
    }, setFile: function (mp3, ogg)
    {
      this.element.trigger("jPlayer.setFile", [mp3, ogg]);
    }, clearFile: function ()
    {
      this.element.trigger("jPlayer.clearFile");
    }, load: function ()
    {
      this.element.trigger("jPlayer.load");
    }, play: function ()
    {
      this.element.trigger("jPlayer.play");
    }, pause: function ()
    {
      this.element.trigger("jPlayer.pause");
    }, stop: function ()
    {
      this.element.trigger("jPlayer.stop");
    }, playHead: function (p)
    {
      this.element.trigger("jPlayer.playHead", [p]);
    }, playHeadTime: function (t)
    {
      this.element.trigger("jPlayer.playHeadTime", [t]);
    }, volume: function (v)
    {
      v = this._limitValue(v, 0, 100);
      this.element.trigger("jPlayer.volume", [v]);
    }, cssId: function (fn, id)
    {
      var self = this;
      if (typeof id == 'string')
      {
        if ($.jPlayer._cssId[fn])
        {
          if (this.config.cssId[fn] != undefined)
          {
            this.config.cssSelector[fn].unbind("click", this.config.clickHandler[fn]);
          }
          this.config.cssId[fn] = id;
          this.config.cssSelector[fn] = $("#" + id);
          this.config.clickHandler[fn] = function (e)
          {
            self[fn](e);
            $(this).blur();
            return false;
          }
          this.config.cssSelector[fn].click(this.config.clickHandler[fn]);
          var display = this.config.cssSelector[fn].css("display");
          if (fn == "play")
          {
            this.config.cssDisplay["pause"] = display;
          }
          if (!(fn == "pause" && display == "none"))
          {
            this.config.cssDisplay[fn] = display;
            if (fn == "pause")
            {
              this.config.cssSelector[fn].css("display", "none");
            }
          }
        }
        else
        {
          this._warning("Unknown/Illegal function in cssId\n\njPlayer('cssId', '" + fn + "', '" + id + "')");
        }
      }
      else
      {
        this._warning("cssId CSS Id must be a string\n\njPlayer('cssId', '" + fn + "', " + id + ")");
      }
    }, loadBar: function (e)
    {
      if (this.config.cssId.loadBar != undefined)
      {
        var offset = this.config.cssSelector.loadBar.offset();
        var x = e.pageX - offset.left;
        var w = this.config.cssSelector.loadBar.width();
        var p = 100 * x / w;
        this.playHead(p);
      }
    }, playBar: function (e)
    {
      this.loadBar(e);
    }, onProgressChange: function (fn)
    {
      if ($.isFunction(fn))
      {
        this.onProgressChangeCustom = fn;
      }
      else
      {
        this._warning("onProgressChange parameter is not a function.");
      }
    }, onProgressChangeCustom: function ()
    {
    }, jPlayerOnProgressChange: function (lp, ppr, ppa, pt, tt)
    {
      this.config.diag.loadPercent = lp;
      this.config.diag.playedPercentRelative = ppr;
      this.config.diag.playedPercentAbsolute = ppa;
      this.config.diag.playedTime = pt;
      this.config.diag.totalTime = tt;
      if (this.config.cssId.loadBar != undefined)
      {
        this.config.cssSelector.loadBar.width(lp + "%");
      }
      if (this.config.cssId.playBar != undefined)
      {
        this.config.cssSelector.playBar.width(ppr + "%");
      }
      this.onProgressChangeCustom(lp, ppr, ppa, pt, tt);
      this._forceUpdate();
    }, jPlayerController: function (override)
    {
      var pt = 0, tt = 0, ppa = 0, lp = 0, ppr = 0;
      if (this.config.audio.readyState >= 1)
      {
        pt = this.config.audio.currentTime * 1000;
        tt = this.config.audio.duration * 1000;
        tt = isNaN(tt) ? 0 : tt;
        ppa = (tt > 0) ? 100 * pt / tt : 0;
        if ((typeof this.config.audio.buffered == "object") && (this.config.audio.buffered.length > 0))
        {
          lp = 100 * this.config.audio.buffered.end(this.config.audio.buffered.length - 1) / this.config.audio.duration;
          ppr = 100 * this.config.audio.currentTime / this.config.audio.buffered.end(this.config.audio.buffered.length - 1);
        }
        else
        {
          lp = 100;
          ppr = ppa;
        }
      }
      if (!this.config.diag.isPlaying && lp >= 100)
      {
        clearInterval(this.config.jPlayerControllerId);
      }
      if (override)
      {
        this.jPlayerOnProgressChange(lp, 0, 0, 0, tt);
      }
      else
      {
        this.jPlayerOnProgressChange(lp, ppr, ppa, pt, tt);
      }
    }, volumeMin: function ()
    {
      this.volume(0);
    }, volumeMax: function ()
    {
      this.volume(100);
    }, volumeBar: function (e)
    {
      if (this.config.cssId.volumeBar != undefined)
      {
        var offset = this.config.cssSelector.volumeBar.offset();
        var x = e.pageX - offset.left;
        var w = this.config.cssSelector.volumeBar.width();
        var p = 100 * x / w;
        this.volume(p);
      }
    }, volumeBarValue: function (e)
    {
      this.volumeBar(e);
    }, jPlayerVolume: function (v)
    {
      if (this.config.cssId.volumeBarValue != null)
      {
        this.config.cssSelector.volumeBarValue.width(v + "%");
        this._forceUpdate();
      }
    }, onSoundComplete: function (fn)
    {
      if ($.isFunction(fn))
      {
        this.onSoundCompleteCustom = fn;
      }
      else
      {
        this._warning("onSoundComplete parameter is not a function.");
      }
    }, onSoundCompleteCustom: function ()
    {
    }, jPlayerOnSoundComplete: function ()
    {
      this.element.trigger("jPlayer.setButtons", false);
      this.onSoundCompleteCustom();
    }, getData: function (name)
    {
      var n = name.split(".");
      var p = this.config;
      for (var i = 0; i < n.length; i++)
      {
        if (p[n[i]] != undefined)
        {
          p = p[n[i]];
        }
        else
        {
          this._warning("Undefined data requested.\n\njPlayer('getData', '" + name + "')");
          return undefined;
        }
      }
      return p;
    }, _getMovie: function ()
    {
      return document[this.config.fid];
    }, _checkForFlash: function (version)
    {
      var flashIsInstalled = false;
      var flash;
      if (window.ActiveXObject)
      {
        try
        {
          flash = new ActiveXObject(("ShockwaveFlash.ShockwaveFlash." + version));
          flashIsInstalled = true;
        }
        catch (e)
        {
        }
      }
      else if (navigator.plugins && navigator.mimeTypes.length > 0)
      {
        flash = navigator.plugins["Shockwave Flash"];
        if (flash)
        {
          var flashVersion = navigator.plugins["Shockwave Flash"].description.replace(/.*\s(\d+\.\d+).*/, "$1");
          if (flashVersion >= version)
          {
            flashIsInstalled = true;
          }
        }
      }
      return flashIsInstalled;
    }, _forceUpdate: function ()
    {
      if (this.config.graphicsFix)
      {
        this.config.hSel.text("" + Math.random());
      }
    }, _limitValue: function (value, min, max)
    {
      return (value < min) ? min : ((value > max) ? max : value);
    }, _flashError: function (e)
    {
      this._error("Problem with Flash component.\n\nCheck the swfPath points at the Jplayer.swf path.\n\nswfPath = " + this.config.swfPath + "\nurl: " + this.config.swf + "\n\nError: " + e.message);
    }, _error: function (msg)
    {
      if (this.config.errorAlerts)
      {
        this._alert("Error!\n\n" + msg);
      }
    }, _warning: function (msg)
    {
      if (this.config.warningAlerts)
      {
        this._alert("Warning!\n\n" + msg);
      }
    }, _alert: function (msg)
    {
      alert("jPlayer " + this.config.version + " : id='" + this.config.id + "' : " + msg);
    }
  };
})(jQuery);
function pkInlineTaggableWidget(selector, options)
{
  $(selector).each(function ()
                   {
                     var typeaheadUrl = options['typeahead-url'];
                     var tagsLabel = (options['tags-label']) ? options['tags-label'] : 'Existing Tags';
                     var popularTagsLabel = (options['popular-tags-label']) ? options['popular-tags-label'] : 'Popular Tags';
                     var popularTags = options['popular-tags'];
                     var existingTags = {};
                     var allTags = options['all-tags'];
                     var commitSelector = options['commit-selector'];
                     var commitEvent = (options['commit-event']) ? options['commit-event'] : 'click';
                     var addLinkClass = (options['add-link-class']) ? options['add-link-class'] : 'a-popular-tags';
                     var removeLinkClass = (options['remove-link-class']) ? options['remove-link-class'] : 'a-existing-tags';
                     if (typeof(popularTags) == 'undefined')
                     {
                       popularTags = {};
                     }
                     ;
                     if (typeof(allTags) == 'undefined')
                     {
                       allTags == {};
                     }
                     ;
                     if ($.trim($(this).val()) != '')
                     {
                       var lp = $(this).val().split(',');
                       for (x in lp)
                       {
                         existingTags[$.trim(lp[x])] = $.trim(lp[x]);
                       }
                     }
                     function makePopularLink(attributes, title, text)
                     {
                       var new_tag = $('<span />');
                       var new_link = $('<a />');
                       new_tag.attr({title: title}).addClass('a-tag a-popular');
                       new_tag.prepend(new_link);
                       new_link.html(title + "<span class='a-tag-count icon'>" + text + "</span>");
                       new_link.attr(attributes).addClass('a-link icon icon-right no-icon');
                       return new_tag;
                     }

                     function makeRemoveLink(attributes, title, text)
                     {
                       title = $.trim(title);
                       var new_tag = $('<span />');
                       var new_link = $('<a />');
                       var tagTitle = title;
                       if (typeof(allTags) != 'undefined')
                       {
                         if (typeof(allTags[title]) != 'undefined')
                         {
                           title = title + '<span class="a-tag-count icon">' + allTags[title] + '</span>';
                         }
                         else
                         {
                           title = title + '<span class="a-tag-count icon">0</span>';
                         }
                       }
                       new_link.text(tagTitle);
                       new_link.attr(attributes);
                       new_link.attr({title: 'Remove Tag'}).addClass('a-link icon icon-right a-close-small alt');
                       new_link.prepend('<span class="icon"></span>');
                       new_tag.attr({title: tagTitle}).addClass('a-tag a-existing');
                       new_tag.append(new_link);
                       return new_tag;
                     }

                     function trimExcessCommas(string)
                     {
                       string = string.replace(/(^,)|(, ?$)/g, '');
                       string = string.replace(/(,,)|(, ,)/, ',');
                       string = $.trim(string);
                       return string;
                     }

                     function split(val)
                     {
                       return val.split(/,\s*/);
                     }

                     function extractLast(term)
                     {
                       return split(term).pop();
                     }

                     function multipleSelect(event, ui)
                     {
                       var terms = split(this.value);
                       terms.pop();
                       terms.push(ui.item.value);
                       terms.push("");
                       this.value = terms.join(", ");
                       return false;
                     }

                     function multipleFocus()
                     {
                       return false;
                     }

                     function multipleSearch()
                     {
                       var term = extractLast(this.value);
                       if (term.length < 2)
                       {
                         return false;
                       }
                     }

                     var unusedPopulars = {};
                     for (x in popularTags)
                     {
                       if (typeof(existingTags[x]) == 'undefined')
                       {
                         unusedPopulars[x] = popularTags[x];
                       }
                     }
                     var popularsAttributes = {};
                     var existingTagsAttributes = {};
                     var existingDiv = $('<div />');
                     var popularsDiv = $('<div />');
                     var tagInput = $(this);
                     var typeAheadContainer = $('<div />');
                     var typeAheadBox = $('<input />');
                     var typeAheadBoxId = 'inline-tag-ahead-box-' + Math.floor(Math.random() * 2000);
                     typeAheadBox.attr('type', 'text');
                     typeAheadBox.attr('id', typeAheadBoxId);
                     if ((typeof(allTags) == 'undefined') && (typeof(typeaheadUrl) != 'undefined'))
                     {
                       typeAheadBox.autocomplete({
                                                   source: function (request, response)
                                                   {
                                                     $.getJSON(typeaheadUrl, {term: extractLast(request.term)}, response);
                                                   }, search: multipleSearch, focus: multipleFocus, select: multipleSelect
                                                 });
                     }
                     else if (typeof(allTags) != 'undefined')
                     {
                       var allTagsReformat = new Array();
                       for (x in allTags)
                       {
                         allTagsReformat.push(x);
                       }
                       typeAheadBox.autocomplete({
                                                   source: function (request, response)
                                                   {
                                                     response($.ui.autocomplete.filter(allTagsReformat, extractLast(request.term)));
                                                   }, search: multipleSearch, focus: multipleFocus, select: multipleSelect
                                                 });
                     }
                     var addButton = $('<a />');
                     addButton.html('<span class="icon"></span>Add');
                     addButton.attr({'href': '#', 'class': 'a-btn icon a-add add-tags-link', 'title': 'Add these tags'});
                     typeAheadContainer.addClass('a-inline-taggable-widget').append(typeAheadBox).append(addButton);
                     tagInput.hide();
                     tagInput.parent().append(typeAheadContainer);
                     function addTagsToForm(link)
                     {
                       var tag = link.attr('title');
                       var value = tagInput.val() + ', ' + tag;
                       value = trimExcessCommas(value);
                       tagInput.val(value);
                       if (link.parent().children().length == 2)
                       {
                         link.parent().children('h4').hide();
                       }
                       link.remove();
                       var new_link = makeRemoveLink(existingTagsAttributes, tag, tag + ' x');
                       new_link.children('a').bind('click', function ()
                       {
                         removeTagsFromForm($(this).parent());
                         return false;
                       });
                       existingDiv.append(new_link);
                       existingDiv.children('h4').show();
                     }

                     function removeTagsFromForm(link)
                     {
                       var tag = link.attr('title');
                       var value = tagInput.val();
                       value = value.replace(tag, '');
                       value = trimExcessCommas(value);
                       tagInput.val(value);
                       if (link.parent().children().length == 2)
                       {
                         link.parent().children('h4').hide();
                       }
                       link.remove();
                       if (typeof(popularTags[tag]) != 'undefined')
                       {
                         var linkLabel = popularTags[tag];
                         var new_link = makePopularLink(existingTagsAttributes, tag, linkLabel);
                         new_link.children('a').bind('click', function ()
                         {
                           addTagsToForm($(this).parent());
                           return false;
                         });
                         popularsDiv.children('h4').show();
                         popularsDiv.append(new_link);
                       }
                     }

                     function makeTagContainer(containerLabel, tagArray, linkAttributes, linkLabelType)
                     {
                       var tagContainer = $('<div />');
                       tagContainer.addClass('a-inline-taggable-widget-tag-container');
                       var header = $('<h4 />');
                       header.text(containerLabel).addClass('a-tag-heading');
                       tagContainer.append(header);
                       if (objEmpty(tagArray))
                       {
                         header.hide();
                       }
                       var attributes = {};
                       for (x in tagArray)
                       {
                         var linkLabel = '';
                         if (linkLabelType == 'add')
                         {
                           tagContainer.addClass(addLinkClass);
                           linkLabel = tagArray[x];
                           var new_link = makePopularLink(linkAttributes, x, linkLabel);
                           new_link.children('a').bind('click', function ()
                           {
                             addTagsToForm($(this).parent());
                             return false;
                           });
                         }
                         else if (linkLabelType == 'remove')
                         {
                           tagContainer.addClass(removeLinkClass);
                           linkLabel = 'x ' + x;
                           var new_link = makeRemoveLink(linkAttributes, x, linkLabel);
                           new_link.children('a').bind('click', function ()
                           {
                             removeTagsFromForm($(this).parent());
                             return false;
                           });
                         }
                         tagContainer.append(new_link);
                       }
                       return tagContainer;
                     }

                     function commitTagsToForm()
                     {
                       if (typeAheadBox.val() != '')
                       {
                         var value = tagInput.val() + ',' + typeAheadBox.val();
                         value = trimExcessCommas(value);
                         tagInput.val(value);
                         typeAheadBox.val('');
                         existingTags = {};
                         var lp = value.split(',');
                         for (x in lp)
                         {
                           existingTags[lp[x]] = lp[x];
                         }
                         existingDiv.html(makeTagContainer(tagsLabel, existingTags, existingTagsAttributes, 'remove').html());
                         existingDiv.find('a').each(function ()
                                                    {
                                                      $(this).bind('click', function ()
                                                      {
                                                        removeTagsFromForm($(this).parent());
                                                        return false;
                                                      });
                                                    });
                       }
                       return false;
                     }

                     addButton.bind('click', function ()
                     {
                       commitTagsToForm();
                       return false;
                     });
                     if (commitSelector != 'undefined')
                     {
                       $(commitSelector).bind(commitEvent, function ()
                       {
                         commitTagsToForm();
                         return true;
                       });
                     }
                     existingDiv = makeTagContainer(tagsLabel, existingTags, existingTagsAttributes, 'remove');
                     existingDiv.addClass(removeLinkClass).children('a').bind('click', function ()
                     {
                       removeTagsFromForm($(this));
                       return false;
                     });
                     tagInput.parent().prepend(existingDiv);
                     popularsDiv = makeTagContainer(popularTagsLabel, unusedPopulars, popularsAttributes, 'add');
                     popularsDiv.children('a').bind('click', function ()
                     {
                       addTagsToForm($(this));
                       return false;
                     });
                     tagInput.parent().append(popularsDiv);
                     $(document).keyup(function (e)
                                       {
                                         if (e.keyCode == 13)
                                         {
                                           if (typeAheadBox.get(0) === $(document.activeElement).get(0))
                                           {
                                             e.preventDefault();
                                           }
                                         }
                                       });
                     $(document).keypress(function (e)
                                          {
                                            if (e.keyCode == 13)
                                            {
                                              if (typeAheadBox.get(0) === $(document.activeElement).get(0))
                                              {
                                                e.preventDefault();
                                              }
                                            }
                                          });
                     typeAheadBox.keyup(function (e)
                                        {
                                          if (e.keyCode == 13)
                                          {
                                            e.preventDefault();
                                            commitTagsToForm();
                                          }
                                        });
                     function objEmpty(obj)
                     {
                       for (var prop in obj)
                       {
                         if (obj.hasOwnProperty(prop))
                         {
                           return false;
                         }
                       }
                       return true;
                     }
                   });
}
function pkTagahead(tagaheadUrl)
{
  $(function ()
    {
      function getKey(event)
      {
        return event.keyCode ? event.keyCode : event.which;
      }

      function setClick(target)
      {
        $(target).find('a').click(function (event)
                                  {
                                    var span = this.parentNode.parentNode.parentNode;
                                    var input = $(span).data("tag-peer");
                                    var parent = this.parentNode;
                                    $(input).val($(parent).text());
                                    $(input).focus();
                                    return false;
                                  });
      }

      $('input.tag-input').after("<div class='tag-suggestions'></div>");
      $('input.tag-input').each(function ()
                                {
                                  $(this).data("tag-peer", $(this).next()[0]);
                                });
      $('div.tag-suggestions').each(function ()
                                    {
                                      $(this).data("tag-peer", $(this).prev()[0]);
                                    });
      $('input.tag-input').keyup(function (event)
                                 {
                                   var key = getKey(event);
                                   if (key == 9)
                                   {
                                     var peer = $(this).data("tag-peer");
                                     var suggestions = $(peer).find("li");
                                     if (suggestions.length)
                                     {
                                       $(this).val($(suggestions[0]).text());
                                       $(this).focus();
                                     }
                                     return false;
                                   }
                                   else
                                   {
                                   }
                                 });
      $('input.tag-input').keypress(function (event)
                                    {
                                      var key = getKey(event);
                                      if (key == 9)
                                      {
                                        return false;
                                      }
                                    });
      var lastValues = {};
      setInterval(function ()
                  {
                    $('input.tag-input').each(function ()
                                              {
                                                var last = $(this).data('tag-last');
                                                var value = $(this).val();
                                                var peer = $(this).data('tag-peer');
                                                if (last !== value)
                                                {
                                                  $(this).data('tag-last', value);
                                                  $.post(tagaheadUrl, {current: $(this).val()}, function (data, textStatus)
                                                  {
                                                    $(peer).html(data);
                                                    setClick(peer);
                                                  });
                                                }
                                              });
                  }, 200);
    });
}
(function ($)
{
  $.extend($.fn, {
    validate: function (options)
    {
      if (!this.length)
      {
        options && options.debug && window.console && console.warn("nothing selected, can't validate, returning nothing");
        return;
      }
      var validator = $.data(this[0], 'validator');
      if (validator)
      {
        return validator;
      }
      validator = new $.validator(options, this[0]);
      $.data(this[0], 'validator', validator);
      if (validator.settings.onsubmit)
      {
        this.find("input, button").filter(".cancel").click(function ()
                                                           {
                                                             validator.cancelSubmit = true;
                                                           });
        if (validator.settings.submitHandler)
        {
          this.find("input, button").filter(":submit").click(function ()
                                                             {
                                                               validator.submitButton = this;
                                                             });
        }
        this.submit(function (event)
                    {
                      if (validator.settings.debug)
                      {
                        event.preventDefault();
                      }
                      function handle()
                      {
                        if (validator.settings.submitHandler)
                        {
                          if (validator.submitButton)
                          {
                            var hidden = $("<input type='hidden'/>").attr("name", validator.submitButton.name).val(validator.submitButton.value).appendTo(validator.currentForm);
                          }
                          validator.settings.submitHandler.call(validator, validator.currentForm);
                          if (validator.submitButton)
                          {
                            hidden.remove();
                          }
                          return false;
                        }
                        return true;
                      }

                      if (validator.cancelSubmit)
                      {
                        validator.cancelSubmit = false;
                        return handle();
                      }
                      if (validator.form())
                      {
                        if (validator.pendingRequest)
                        {
                          validator.formSubmitted = true;
                          return false;
                        }
                        return handle();
                      }
                      else
                      {
                        validator.focusInvalid();
                        return false;
                      }
                    });
      }
      return validator;
    }, valid: function ()
    {
      if ($(this[0]).is('form'))
      {
        return this.validate().form();
      }
      else
      {
        var valid = true;
        var validator = $(this[0].form).validate();
        this.each(function ()
                  {
                    valid &= validator.element(this);
                  });
        return valid;
      }
    }, removeAttrs: function (attributes)
    {
      var result = {}, $element = this;
      $.each(attributes.split(/\s/), function (index, value)
      {
        result[value] = $element.attr(value);
        $element.removeAttr(value);
      });
      return result;
    }, rules: function (command, argument)
    {
      var element = this[0];
      if (command)
      {
        var settings = $.data(element.form, 'validator').settings;
        var staticRules = settings.rules;
        var existingRules = $.validator.staticRules(element);
        switch (command)
        {
          case"add":
            $.extend(existingRules, $.validator.normalizeRule(argument));
            staticRules[element.name] = existingRules;
            if (argument.messages)
            {
              settings.messages[element.name] = $.extend(settings.messages[element.name], argument.messages);
            }
            break;
          case"remove":
            if (!argument)
            {
              delete staticRules[element.name];
              return existingRules;
            }
            var filtered = {};
            $.each(argument.split(/\s/), function (index, method)
            {
              filtered[method] = existingRules[method];
              delete existingRules[method];
            });
            return filtered;
        }
      }
      var data = $.validator.normalizeRules($.extend({}, $.validator.metadataRules(element), $.validator.classRules(element), $.validator.attributeRules(element), $.validator.staticRules(element)), element);
      if (data.required)
      {
        var param = data.required;
        delete data.required;
        data = $.extend({required: param}, data);
      }
      return data;
    }
  });
  $.extend($.expr[":"], {
    blank: function (a)
    {
      return !$.trim("" + a.value);
    }, filled: function (a)
    {
      return !!$.trim("" + a.value);
    }, unchecked: function (a)
    {
      return !a.checked;
    }
  });
  $.validator = function (options, form)
  {
    this.settings = $.extend(true, {}, $.validator.defaults, options);
    this.currentForm = form;
    this.init();
  };
  $.validator.format = function (source, params)
  {
    if (arguments.length == 1)
    {
      return function ()
      {
        var args = $.makeArray(arguments);
        args.unshift(source);
        return $.validator.format.apply(this, args);
      };
    }
    if (arguments.length > 2 && params.constructor != Array)
    {
      params = $.makeArray(arguments).slice(1);
    }
    if (params.constructor != Array)
    {
      params = [params];
    }
    $.each(params, function (i, n)
    {
      source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
    });
    return source;
  };
  $.extend($.validator, {
    defaults: {
      messages: {},
      groups: {},
      rules: {},
      errorClass: "error",
      validClass: "valid",
      errorElement: "label",
      focusInvalid: true,
      errorContainer: $([]),
      errorLabelContainer: $([]),
      onsubmit: true,
      ignore: [],
      ignoreTitle: false,
      onfocusin: function (element)
      {
        this.lastActive = element;
        if (this.settings.focusCleanup && !this.blockFocusCleanup)
        {
          this.settings.unhighlight && this.settings.unhighlight.call(this, element, this.settings.errorClass, this.settings.validClass);
          this.errorsFor(element).hide();
        }
      },
      onfocusout: function (element)
      {
        if (!this.checkable(element) && (element.name in this.submitted || !this.optional(element)))
        {
          this.element(element);
        }
      },
      onkeyup: function (element)
      {
        if (element.name in this.submitted || element == this.lastElement)
        {
          this.element(element);
        }
      },
      onclick: function (element)
      {
        if (element.name in this.submitted)
        {
          this.element(element);
        }
        else if (element.parentNode.name in this.submitted)
        {
          this.element(element.parentNode);
        }
      },
      highlight: function (element, errorClass, validClass)
      {
        $(element).addClass(errorClass).removeClass(validClass);
      },
      unhighlight: function (element, errorClass, validClass)
      {
        $(element).removeClass(errorClass).addClass(validClass);
      }
    },
    setDefaults: function (settings)
    {
      $.extend($.validator.defaults, settings);
    },
    messages: {
      required: "This field is required.",
      remote: "Please fix this field.",
      email: "Please enter a valid email address.",
      url: "Please enter a valid URL.",
      date: "Please enter a valid date.",
      dateISO: "Please enter a valid date (ISO).",
      number: "Please enter a valid number.",
      digits: "Please enter only digits.",
      creditcard: "Please enter a valid credit card number.",
      equalTo: "Please enter the same value again.",
      accept: "Please enter a value with a valid extension.",
      maxlength: $.validator.format("Please enter no more than {0} characters."),
      minlength: $.validator.format("Please enter at least {0} characters."),
      rangelength: $.validator.format("Please enter a value between {0} and {1} characters long."),
      range: $.validator.format("Please enter a value between {0} and {1}."),
      max: $.validator.format("Please enter a value less than or equal to {0}."),
      min: $.validator.format("Please enter a value greater than or equal to {0}.")
    },
    autoCreateRanges: false,
    prototype: {
      init: function ()
      {
        this.labelContainer = $(this.settings.errorLabelContainer);
        this.errorContext = this.labelContainer.length && this.labelContainer || $(this.currentForm);
        this.containers = $(this.settings.errorContainer).add(this.settings.errorLabelContainer);
        this.submitted = {};
        this.valueCache = {};
        this.pendingRequest = 0;
        this.pending = {};
        this.invalid = {};
        this.reset();
        var groups = (this.groups = {});
        $.each(this.settings.groups, function (key, value)
        {
          $.each(value.split(/\s/), function (index, name)
          {
            groups[name] = key;
          });
        });
        var rules = this.settings.rules;
        $.each(rules, function (key, value)
        {
          rules[key] = $.validator.normalizeRule(value);
        });
        function delegate(event)
        {
          var validator = $.data(this[0].form, "validator"), eventType = "on" + event.type.replace(/^validate/, "");
          validator.settings[eventType] && validator.settings[eventType].call(validator, this[0]);
        }

        $(this.currentForm).validateDelegate(":text, :password, :file, select, textarea", "focusin focusout keyup", delegate).validateDelegate(":radio, :checkbox, select, option", "click", delegate);
        if (this.settings.invalidHandler)
        {
          $(this.currentForm).bind("invalid-form.validate", this.settings.invalidHandler);
        }
      }, form: function ()
      {
        this.checkForm();
        $.extend(this.submitted, this.errorMap);
        this.invalid = $.extend({}, this.errorMap);
        if (!this.valid())
        {
          $(this.currentForm).triggerHandler("invalid-form", [this]);
        }
        this.showErrors();
        return this.valid();
      }, checkForm: function ()
      {
        this.prepareForm();
        for (var i = 0, elements = (this.currentElements = this.elements()); elements[i]; i++)
        {
          this.check(elements[i]);
        }
        return this.valid();
      }, element: function (element)
      {
        element = this.clean(element);
        this.lastElement = element;
        this.prepareElement(element);
        this.currentElements = $(element);
        var result = this.check(element);
        if (result)
        {
          delete this.invalid[element.name];
        }
        else
        {
          this.invalid[element.name] = true;
        }
        if (!this.numberOfInvalids())
        {
          this.toHide = this.toHide.add(this.containers);
        }
        this.showErrors();
        return result;
      }, showErrors: function (errors)
      {
        if (errors)
        {
          $.extend(this.errorMap, errors);
          this.errorList = [];
          for (var name in errors)
          {
            this.errorList.push({message: errors[name], element: this.findByName(name)[0]});
          }
          this.successList = $.grep(this.successList, function (element)
          {
            return !(element.name in errors);
          });
        }
        this.settings.showErrors ? this.settings.showErrors.call(this, this.errorMap, this.errorList) : this.defaultShowErrors();
      }, resetForm: function ()
      {
        if ($.fn.resetForm)
        {
          $(this.currentForm).resetForm();
        }
        this.submitted = {};
        this.prepareForm();
        this.hideErrors();
        this.elements().removeClass(this.settings.errorClass);
      }, numberOfInvalids: function ()
      {
        return this.objectLength(this.invalid);
      }, objectLength: function (obj)
      {
        var count = 0;
        for (var i in obj)
        {
          count++;
        }
        return count;
      }, hideErrors: function ()
      {
        this.addWrapper(this.toHide).hide();
      }, valid: function ()
      {
        return this.size() == 0;
      }, size: function ()
      {
        return this.errorList.length;
      }, focusInvalid: function ()
      {
        if (this.settings.focusInvalid)
        {
          try
          {
            $(this.findLastActive() || this.errorList.length && this.errorList[0].element || []).filter(":visible").focus().trigger("focusin");
          }
          catch (e)
          {
          }
        }
      }, findLastActive: function ()
      {
        var lastActive = this.lastActive;
        return lastActive && $.grep(this.errorList, function (n)
          {
            return n.element.name == lastActive.name;
          }).length == 1 && lastActive;
      }, elements: function ()
      {
        var validator = this, rulesCache = {};
        return $([]).add(this.currentForm.elements).filter(":input").not(":submit, :reset, :image, [disabled]").not(this.settings.ignore).filter(function ()
                                                                                                                                                 {
                                                                                                                                                   !this.name && validator.settings.debug && window.console && console.error("%o has no name assigned", this);
                                                                                                                                                   if (this.name in rulesCache || !validator.objectLength($(this).rules()))
                                                                                                                                                   {
                                                                                                                                                     return false;
                                                                                                                                                   }
                                                                                                                                                   rulesCache[this.name] = true;
                                                                                                                                                   return true;
                                                                                                                                                 });
      }, clean: function (selector)
      {
        return $(selector)[0];
      }, errors: function ()
      {
        return $(this.settings.errorElement + "." + this.settings.errorClass, this.errorContext);
      }, reset: function ()
      {
        this.successList = [];
        this.errorList = [];
        this.errorMap = {};
        this.toShow = $([]);
        this.toHide = $([]);
        this.currentElements = $([]);
      }, prepareForm: function ()
      {
        this.reset();
        this.toHide = this.errors().add(this.containers);
      }, prepareElement: function (element)
      {
        this.reset();
        this.toHide = this.errorsFor(element);
      }, check: function (element)
      {
        element = this.clean(element);
        if (this.checkable(element))
        {
          element = this.findByName(element.name)[0];
        }
        var rules = $(element).rules();
        var dependencyMismatch = false;
        for (method in rules)
        {
          var rule = {method: method, parameters: rules[method]};
          try
          {
            var result = $.validator.methods[method].call(this, element.value.replace(/\r/g, ""), element, rule.parameters);
            if (result == "dependency-mismatch")
            {
              dependencyMismatch = true;
              continue;
            }
            dependencyMismatch = false;
            if (result == "pending")
            {
              this.toHide = this.toHide.not(this.errorsFor(element));
              return;
            }
            if (!result)
            {
              this.formatAndAdd(element, rule);
              return false;
            }
          }
          catch (e)
          {
            this.settings.debug && window.console && console.log("exception occured when checking element " + element.id
                                                                 + ", check the '" + rule.method + "' method", e);
            throw e;
          }
        }
        if (dependencyMismatch)
        {
          return;
        }
        if (this.objectLength(rules))
        {
          this.successList.push(element);
        }
        return true;
      }, customMetaMessage: function (element, method)
      {
        if (!$.metadata)
        {
          return;
        }
        var meta = this.settings.meta ? $(element).metadata()[this.settings.meta] : $(element).metadata();
        return meta && meta.messages && meta.messages[method];
      }, customMessage: function (name, method)
      {
        var m = this.settings.messages[name];
        return m && (m.constructor == String ? m : m[method]);
      }, findDefined: function ()
      {
        for (var i = 0; i < arguments.length; i++)
        {
          if (arguments[i] !== undefined)
          {
            return arguments[i];
          }
        }
        return undefined;
      }, defaultMessage: function (element, method)
      {
        return this.findDefined(this.customMessage(element.name, method), this.customMetaMessage(element, method), !this.settings.ignoreTitle && element.title || undefined, $.validator.messages[method], "<strong>Warning: No message defined for " + element.name + "</strong>");
      }, formatAndAdd: function (element, rule)
      {
        var message = this.defaultMessage(element, rule.method), theregex = /\$?\{(\d+)\}/g;
        if (typeof message == "function")
        {
          message = message.call(this, rule.parameters, element);
        }
        else if (theregex.test(message))
        {
          message = jQuery.format(message.replace(theregex, '{$1}'), rule.parameters);
        }
        this.errorList.push({message: message, element: element});
        this.errorMap[element.name] = message;
        this.submitted[element.name] = message;
      }, addWrapper: function (toToggle)
      {
        if (this.settings.wrapper)
        {
          toToggle = toToggle.add(toToggle.parent(this.settings.wrapper));
        }
        return toToggle;
      }, defaultShowErrors: function ()
      {
        for (var i = 0; this.errorList[i]; i++)
        {
          var error = this.errorList[i];
          this.settings.highlight && this.settings.highlight.call(this, error.element, this.settings.errorClass, this.settings.validClass);
          this.showLabel(error.element, error.message);
        }
        if (this.errorList.length)
        {
          this.toShow = this.toShow.add(this.containers);
        }
        if (this.settings.success)
        {
          for (var i = 0; this.successList[i]; i++)
          {
            this.showLabel(this.successList[i]);
          }
        }
        if (this.settings.unhighlight)
        {
          for (var i = 0, elements = this.validElements(); elements[i]; i++)
          {
            this.settings.unhighlight.call(this, elements[i], this.settings.errorClass, this.settings.validClass);
          }
        }
        this.toHide = this.toHide.not(this.toShow);
        this.hideErrors();
        this.addWrapper(this.toShow).show();
      }, validElements: function ()
      {
        return this.currentElements.not(this.invalidElements());
      }, invalidElements: function ()
      {
        return $(this.errorList).map(function ()
                                     {
                                       return this.element;
                                     });
      }, showLabel: function (element, message)
      {
        var label = this.errorsFor(element);
        if (label.length)
        {
          label.removeClass().addClass(this.settings.errorClass);
          label.attr("generated") && label.html(message);
        }
        else
        {
          label = $("<" + this.settings.errorElement + "/>").attr({
                                                                    "for": this.idOrName(element),
                                                                    generated: true
                                                                  }).addClass(this.settings.errorClass).html(message || "");
          if (this.settings.wrapper)
          {
            label = label.hide().show().wrap("<" + this.settings.wrapper + "/>").parent();
          }
          if (!this.labelContainer.append(label).length)
          {
            this.settings.errorPlacement ? this.settings.errorPlacement(label, $(element)) : label.insertAfter(element);
          }
        }
        if (!message && this.settings.success)
        {
          label.text("");
          typeof this.settings.success == "string" ? label.addClass(this.settings.success) : this.settings.success(label);
        }
        this.toShow = this.toShow.add(label);
      }, errorsFor: function (element)
      {
        var name = this.idOrName(element);
        return this.errors().filter(function ()
                                    {
                                      return $(this).attr('for') == name;
                                    });
      }, idOrName: function (element)
      {
        return this.groups[element.name] || (this.checkable(element) ? element.name : element.id || element.name);
      }, checkable: function (element)
      {
        return /radio|checkbox/i.test(element.type);
      }, findByName: function (name)
      {
        var form = this.currentForm;
        return $(document.getElementsByName(name)).map(function (index, element)
                                                       {
                                                         return element.form == form && element.name == name && element || null;
                                                       });
      }, getLength: function (value, element)
      {
        switch (element.nodeName.toLowerCase())
        {
          case'select':
            return $("option:selected", element).length;
          case'input':
            if (this.checkable(element))
            {
              return this.findByName(element.name).filter(':checked').length;
            }
        }
        return value.length;
      }, depend: function (param, element)
      {
        return this.dependTypes[typeof param] ? this.dependTypes[typeof param](param, element) : true;
      }, dependTypes: {
        "boolean": function (param, element)
        {
          return param;
        }, "string": function (param, element)
        {
          return !!$(param, element.form).length;
        }, "function": function (param, element)
        {
          return param(element);
        }
      }, optional: function (element)
      {
        return !$.validator.methods.required.call(this, $.trim(element.value), element) && "dependency-mismatch";
      }, startRequest: function (element)
      {
        if (!this.pending[element.name])
        {
          this.pendingRequest++;
          this.pending[element.name] = true;
        }
      }, stopRequest: function (element, valid)
      {
        this.pendingRequest--;
        if (this.pendingRequest < 0)
        {
          this.pendingRequest = 0;
        }
        delete this.pending[element.name];
        if (valid && this.pendingRequest == 0 && this.formSubmitted && this.form())
        {
          $(this.currentForm).submit();
          this.formSubmitted = false;
        }
        else if (!valid && this.pendingRequest == 0 && this.formSubmitted)
        {
          $(this.currentForm).triggerHandler("invalid-form", [this]);
          this.formSubmitted = false;
        }
      }, previousValue: function (element)
      {
        return $.data(element, "previousValue") || $.data(element, "previousValue", {
            old: null,
            valid: true,
            message: this.defaultMessage(element, "remote")
          });
      }
    },
    classRuleSettings: {
      required: {required: true},
      email: {email: true},
      url: {url: true},
      date: {date: true},
      dateISO: {dateISO: true},
      dateDE: {dateDE: true},
      number: {number: true},
      numberDE: {numberDE: true},
      digits: {digits: true},
      creditcard: {creditcard: true}
    },
    addClassRules: function (className, rules)
    {
      className.constructor == String ? this.classRuleSettings[className] = rules : $.extend(this.classRuleSettings, className);
    },
    classRules: function (element)
    {
      var rules = {};
      var classes = $(element).attr('class');
      classes && $.each(classes.split(' '), function ()
      {
        if (this in $.validator.classRuleSettings)
        {
          $.extend(rules, $.validator.classRuleSettings[this]);
        }
      });
      return rules;
    },
    attributeRules: function (element)
    {
      var rules = {};
      var $element = $(element);
      for (method in $.validator.methods)
      {
        var value = $element.attr(method);
        if (value)
        {
          rules[method] = value;
        }
      }
      if (rules.maxlength && /-1|2147483647|524288/.test(rules.maxlength))
      {
        delete rules.maxlength;
      }
      return rules;
    },
    metadataRules: function (element)
    {
      if (!$.metadata)
      {
        return {};
      }
      var meta = $.data(element.form, 'validator').settings.meta;
      return meta ? $(element).metadata()[meta] : $(element).metadata();
    },
    staticRules: function (element)
    {
      var rules = {};
      var validator = $.data(element.form, 'validator');
      if (validator.settings.rules)
      {
        rules = $.validator.normalizeRule(validator.settings.rules[element.name]) || {};
      }
      return rules;
    },
    normalizeRules: function (rules, element)
    {
      $.each(rules, function (prop, val)
      {
        if (val === false)
        {
          delete rules[prop];
          return;
        }
        if (val.param || val.depends)
        {
          var keepRule = true;
          switch (typeof val.depends)
          {
            case"string":
              keepRule = !!$(val.depends, element.form).length;
              break;
            case"function":
              keepRule = val.depends.call(element, element);
              break;
          }
          if (keepRule)
          {
            rules[prop] = val.param !== undefined ? val.param : true;
          }
          else
          {
            delete rules[prop];
          }
        }
      });
      $.each(rules, function (rule, parameter)
      {
        rules[rule] = $.isFunction(parameter) ? parameter(element) : parameter;
      });
      $.each(['minlength', 'maxlength', 'min', 'max'], function ()
      {
        if (rules[this])
        {
          rules[this] = Number(rules[this]);
        }
      });
      $.each(['rangelength', 'range'], function ()
      {
        if (rules[this])
        {
          rules[this] = [Number(rules[this][0]), Number(rules[this][1])];
        }
      });
      if ($.validator.autoCreateRanges)
      {
        if (rules.min && rules.max)
        {
          rules.range = [rules.min, rules.max];
          delete rules.min;
          delete rules.max;
        }
        if (rules.minlength && rules.maxlength)
        {
          rules.rangelength = [rules.minlength, rules.maxlength];
          delete rules.minlength;
          delete rules.maxlength;
        }
      }
      if (rules.messages)
      {
        delete rules.messages;
      }
      return rules;
    },
    normalizeRule: function (data)
    {
      if (typeof data == "string")
      {
        var transformed = {};
        $.each(data.split(/\s/), function ()
        {
          transformed[this] = true;
        });
        data = transformed;
      }
      return data;
    },
    addMethod: function (name, method, message)
    {
      $.validator.methods[name] = method;
      $.validator.messages[name] = message != undefined ? message : $.validator.messages[name];
      if (method.length < 3)
      {
        $.validator.addClassRules(name, $.validator.normalizeRule(name));
      }
    },
    methods: {
      required: function (value, element, param)
      {
        if (!this.depend(param, element))
        {
          return "dependency-mismatch";
        }
        switch (element.nodeName.toLowerCase())
        {
          case'select':
            var val = $(element).val();
            return val && val.length > 0;
          case'input':
            if (this.checkable(element))
            {
              return this.getLength(value, element) > 0;
            }
          default:
            return $.trim(value).length > 0;
        }
      }, remote: function (value, element, param)
      {
        if (this.optional(element))
        {
          return "dependency-mismatch";
        }
        var previous = this.previousValue(element);
        if (!this.settings.messages[element.name])
        {
          this.settings.messages[element.name] = {};
        }
        previous.originalMessage = this.settings.messages[element.name].remote;
        this.settings.messages[element.name].remote = previous.message;
        param = typeof param == "string" && {url: param} || param;
        if (previous.old !== value)
        {
          previous.old = value;
          var validator = this;
          this.startRequest(element);
          var data = {};
          data[element.name] = value;
          $.ajax($.extend(true, {
            url: param, mode: "abort", port: "validate" + element.name, dataType: "json", data: data, success: function (response)
            {
              validator.settings.messages[element.name].remote = previous.originalMessage;
              var valid = response === true;
              if (valid)
              {
                var submitted = validator.formSubmitted;
                validator.prepareElement(element);
                validator.formSubmitted = submitted;
                validator.successList.push(element);
                validator.showErrors();
              }
              else
              {
                var errors = {};
                var message = (previous.message = response || validator.defaultMessage(element, "remote"));
                errors[element.name] = $.isFunction(message) ? message(value) : message;
                validator.showErrors(errors);
              }
              previous.valid = valid;
              validator.stopRequest(element, valid);
            }
          }, param));
          return "pending";
        }
        else if (this.pending[element.name])
        {
          return "pending";
        }
        return previous.valid;
      }, minlength: function (value, element, param)
      {
        return this.optional(element) || this.getLength($.trim(value), element) >= param;
      }, maxlength: function (value, element, param)
      {
        return this.optional(element) || this.getLength($.trim(value), element) <= param;
      }, rangelength: function (value, element, param)
      {
        var length = this.getLength($.trim(value), element);
        return this.optional(element) || (length >= param[0] && length <= param[1]);
      }, min: function (value, element, param)
      {
        return this.optional(element) || value >= param;
      }, max: function (value, element, param)
      {
        return this.optional(element) || value <= param;
      }, range: function (value, element, param)
      {
        return this.optional(element) || (value >= param[0] && value <= param[1]);
      }, email: function (value, element)
      {
        return this.optional(element) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(value);
      }, url: function (value, element)
      {
        return this.optional(element) || /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
      }, date: function (value, element)
      {
        return this.optional(element) || !/Invalid|NaN/.test(new Date(value));
      }, dateISO: function (value, element)
      {
        return this.optional(element) || /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(value);
      }, number: function (value, element)
      {
        return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value);
      }, digits: function (value, element)
      {
        return this.optional(element) || /^\d+$/.test(value);
      }, creditcard: function (value, element)
      {
        if (this.optional(element))
        {
          return "dependency-mismatch";
        }
        if (/[^0-9-]+/.test(value))
        {
          return false;
        }
        var nCheck = 0, nDigit = 0, bEven = false;
        value = value.replace(/\D/g, "");
        for (var n = value.length - 1; n >= 0; n--)
        {
          var cDigit = value.charAt(n);
          var nDigit = parseInt(cDigit, 10);
          if (bEven)
          {
            if ((nDigit *= 2) > 9)
            {
              nDigit -= 9;
            }
          }
          nCheck += nDigit;
          bEven = !bEven;
        }
        return (nCheck % 10) == 0;
      }, accept: function (value, element, param)
      {
        param = typeof param == "string" ? param.replace(/,/g, '|') : "png|jpe?g|gif";
        return this.optional(element) || value.match(new RegExp(".(" + param + ")$", "i"));
      }, equalTo: function (value, element, param)
      {
        var target = $(param).unbind(".validate-equalTo").bind("blur.validate-equalTo", function ()
        {
          $(element).valid();
        });
        return value == target.val();
      }
    }
  });
  $.format = $.validator.format;
})(jQuery);
;
(function ($)
{
  var ajax = $.ajax;
  var pendingRequests = {};
  $.ajax = function (settings)
  {
    settings = $.extend(settings, $.extend({}, $.ajaxSettings, settings));
    var port = settings.port;
    if (settings.mode == "abort")
    {
      if (pendingRequests[port])
      {
        pendingRequests[port].abort();
      }
      return (pendingRequests[port] = ajax.apply(this, arguments));
    }
    return ajax.apply(this, arguments);
  };
})(jQuery);
;
(function ($)
{
  if (!jQuery.event.special.focusin && !jQuery.event.special.focusout && document.addEventListener)
  {
    $.each({focus: 'focusin', blur: 'focusout'}, function (original, fix)
    {
      $.event.special[fix] = {
        setup: function ()
        {
          this.addEventListener(original, handler, true);
        }, teardown: function ()
        {
          this.removeEventListener(original, handler, true);
        }, handler: function (e)
        {
          arguments[0] = $.event.fix(e);
          arguments[0].type = fix;
          return $.event.handle.apply(this, arguments);
        }
      };
      function handler(e)
      {
        e = $.event.fix(e);
        e.type = fix;
        return $.event.handle.call(this, e);
      }
    });
  }
  ;
  $.extend($.fn, {
    validateDelegate: function (delegate, type, handler)
    {
      return this.bind(type, function (event)
      {
        var target = $(event.target);
        if (target.is(delegate))
        {
          return handler.apply(target, arguments);
        }
      });
    }
  });
})(jQuery);
/*
 * jQuery Form Plugin
 * version: 2.49 (18-OCT-2010)
 * @requires jQuery v1.3.2 or later
 *
 * Examples and documentation at: http://malsup.com/jquery/form/
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
;
(function ($)
{
  $.fn.ajaxSubmit = function (options)
  {
    if (!this.length)
    {
      log('ajaxSubmit: skipping submit process - no element selected');
      return this;
    }
    if (typeof options == 'function')
    {
      options = {success: options};
    }
    var url = $.trim(this.attr('action'));
    if (url)
    {
      url = (url.match(/^([^#]+)/) || [])[1];
    }
    url = url || window.location.href || '';
    options = $.extend(true, {
      url: url,
      type: this.attr('method') || 'GET',
      iframeSrc: /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank'
    }, options);
    var veto = {};
    this.trigger('form-pre-serialize', [this, options, veto]);
    if (veto.veto)
    {
      log('ajaxSubmit: submit vetoed via form-pre-serialize trigger');
      return this;
    }
    if (options.beforeSerialize && options.beforeSerialize(this, options) === false)
    {
      log('ajaxSubmit: submit aborted via beforeSerialize callback');
      return this;
    }
    var n, v, a = this.formToArray(options.semantic);
    if (options.data)
    {
      options.extraData = options.data;
      for (n in options.data)
      {
        if (options.data[n]instanceof Array)
        {
          for (var k in options.data[n])
          {
            a.push({name: n, value: options.data[n][k]});
          }
        }
        else
        {
          v = options.data[n];
          v = $.isFunction(v) ? v() : v;
          a.push({name: n, value: v});
        }
      }
    }
    if (options.beforeSubmit && options.beforeSubmit(a, this, options) === false)
    {
      log('ajaxSubmit: submit aborted via beforeSubmit callback');
      return this;
    }
    this.trigger('form-submit-validate', [a, this, options, veto]);
    if (veto.veto)
    {
      log('ajaxSubmit: submit vetoed via form-submit-validate trigger');
      return this;
    }
    var q = $.param(a);
    if (options.type.toUpperCase() == 'GET')
    {
      options.url += (options.url.indexOf('?') >= 0 ? '&' : '?') + q;
      options.data = null;
    }
    else
    {
      options.data = q;
    }
    var $form = this, callbacks = [];
    if (options.resetForm)
    {
      callbacks.push(function ()
                     {
                       $form.resetForm();
                     });
    }
    if (options.clearForm)
    {
      callbacks.push(function ()
                     {
                       $form.clearForm();
                     });
    }
    if (!options.dataType && options.target)
    {
      var oldSuccess = options.success || function ()
        {
        };
      callbacks.push(function (data)
                     {
                       var fn = options.replaceTarget ? 'replaceWith' : 'html';
                       $(options.target)[fn](data).each(oldSuccess, arguments);
                     });
    }
    else if (options.success)
    {
      callbacks.push(options.success);
    }
    options.success = function (data, status, xhr)
    {
      var context = options.context || options;
      for (var i = 0, max = callbacks.length; i < max; i++)
      {
        callbacks[i].apply(context, [data, status, xhr || $form, $form]);
      }
    };
    var fileInputs = $('input:file', this).length > 0;
    var mp = 'multipart/form-data';
    var multipart = ($form.attr('enctype') == mp || $form.attr('encoding') == mp);
    if (options.iframe !== false && (fileInputs || options.iframe || multipart))
    {
      if (options.closeKeepAlive)
      {
        $.get(options.closeKeepAlive, fileUpload);
      }
      else
      {
        fileUpload();
      }
    }
    else
    {
      $.ajax(options);
    }
    this.trigger('form-submit-notify', [this, options]);
    return this;
    function fileUpload()
    {
      var form = $form[0];
      if ($(':input[name=submit],:input[id=submit]', form).length)
      {
        alert('Error: Form elements must not have name or id of "submit".');
        return;
      }
      var s = $.extend(true, {}, $.ajaxSettings, options);
      s.context = s.context || s;
      var id = 'jqFormIO' + (new Date().getTime()), fn = '_' + id;
      window[fn] = function ()
      {
        var f = $io.data('form-plugin-onload');
        if (f)
        {
          f();
          window[fn] = undefined;
          try
          {
            delete window[fn];
          }
          catch (e)
          {
          }
        }
      }
      var $io = $('<iframe id="' + id + '" name="' + id + '" src="' + s.iframeSrc + '" onload="window[\'_\'+this.id]()" />');
      var io = $io[0];
      $io.css({position: 'absolute', top: '-1000px', left: '-1000px'});
      var xhr = {
        aborted: 0, responseText: null, responseXML: null, status: 0, statusText: 'n/a', getAllResponseHeaders: function ()
        {
        }, getResponseHeader: function ()
        {
        }, setRequestHeader: function ()
        {
        }, abort: function ()
        {
          this.aborted = 1;
          $io.attr('src', s.iframeSrc);
        }
      };
      var g = s.global;
      if (g && !$.active++)
      {
        $.event.trigger("ajaxStart");
      }
      if (g)
      {
        $.event.trigger("ajaxSend", [xhr, s]);
      }
      if (s.beforeSend && s.beforeSend.call(s.context, xhr, s) === false)
      {
        if (s.global)
        {
          $.active--;
        }
        return;
      }
      if (xhr.aborted)
      {
        return;
      }
      var cbInvoked = false;
      var timedOut = 0;
      var sub = form.clk;
      if (sub)
      {
        var n = sub.name;
        if (n && !sub.disabled)
        {
          s.extraData = s.extraData || {};
          s.extraData[n] = sub.value;
          if (sub.type == "image")
          {
            s.extraData[n + '.x'] = form.clk_x;
            s.extraData[n + '.y'] = form.clk_y;
          }
        }
      }
      function doSubmit()
      {
        var t = $form.attr('target'), a = $form.attr('action');
        form.setAttribute('target', id);
        if (form.getAttribute('method') != 'POST')
        {
          form.setAttribute('method', 'POST');
        }
        if (form.getAttribute('action') != s.url)
        {
          form.setAttribute('action', s.url);
        }
        if (!s.skipEncodingOverride)
        {
          $form.attr({encoding: 'multipart/form-data', enctype: 'multipart/form-data'});
        }
        if (s.timeout)
        {
          setTimeout(function ()
                     {
                       timedOut = true;
                       cb();
                     }, s.timeout);
        }
        var extraInputs = [];
        try
        {
          if (s.extraData)
          {
            for (var n in s.extraData)
            {
              extraInputs.push($('<input type="hidden" name="' + n + '" value="' + s.extraData[n] + '" />').appendTo(form)[0]);
            }
          }
          $io.appendTo('body');
          $io.data('form-plugin-onload', cb);
          form.submit();
        }
        finally
        {
          form.setAttribute('action', a);
          if (t)
          {
            form.setAttribute('target', t);
          }
          else
          {
            $form.removeAttr('target');
          }
          $(extraInputs).remove();
        }
      }

      if (s.forceSync)
      {
        doSubmit();
      }
      else
      {
        setTimeout(doSubmit, 10);
      }
      var data, doc, domCheckCount = 50;

      function cb()
      {
        if (cbInvoked)
        {
          return;
        }
        $io.removeData('form-plugin-onload');
        var ok = true;
        try
        {
          if (timedOut)
          {
            throw'timeout';
          }
          doc = io.contentWindow ? io.contentWindow.document : io.contentDocument ? io.contentDocument : io.document;
          var isXml = s.dataType == 'xml' || doc.XMLDocument || $.isXMLDoc(doc);
          log('isXml=' + isXml);
          if (!isXml && window.opera && (doc.body == null || doc.body.innerHTML == ''))
          {
            if (--domCheckCount)
            {
              log('requeing onLoad callback, DOM not available');
              setTimeout(cb, 250);
              return;
            }
          }
          cbInvoked = true;
          xhr.responseText = doc.documentElement ? doc.documentElement.innerHTML : null;
          xhr.responseXML = doc.XMLDocument ? doc.XMLDocument : doc;
          xhr.getResponseHeader = function (header)
          {
            var headers = {'content-type': s.dataType};
            return headers[header];
          };
          var scr = /(json|script)/.test(s.dataType);
          if (scr || s.textarea)
          {
            var ta = doc.getElementsByTagName('textarea')[0];
            if (ta)
            {
              xhr.responseText = ta.value;
            }
            else if (scr)
            {
              var pre = doc.getElementsByTagName('pre')[0];
              var b = doc.getElementsByTagName('body')[0];
              if (pre)
              {
                xhr.responseText = pre.innerHTML;
              }
              else if (b)
              {
                xhr.responseText = b.innerHTML;
              }
            }
          }
          else if (s.dataType == 'xml' && !xhr.responseXML && xhr.responseText != null)
          {
            xhr.responseXML = toXml(xhr.responseText);
          }
          data = $.httpData(xhr, s.dataType);
        }
        catch (e)
        {
          log('error caught:', e);
          ok = false;
          xhr.error = e;
          $.handleError(s, xhr, 'error', e);
        }
        if (ok)
        {
          s.success.call(s.context, data, 'success', xhr);
          if (g)
          {
            $.event.trigger("ajaxSuccess", [xhr, s]);
          }
        }
        if (g)
        {
          $.event.trigger("ajaxComplete", [xhr, s]);
        }
        if (g && !--$.active)
        {
          $.event.trigger("ajaxStop");
        }
        if (s.complete)
        {
          s.complete.call(s.context, xhr, ok ? 'success' : 'error');
        }
        setTimeout(function ()
                   {
                     $io.removeData('form-plugin-onload');
                     $io.remove();
                     xhr.responseXML = null;
                   }, 100);
      }

      function toXml(s, doc)
      {
        if (window.ActiveXObject)
        {
          doc = new ActiveXObject('Microsoft.XMLDOM');
          doc.async = 'false';
          doc.loadXML(s);
        }
        else
        {
          doc = (new DOMParser()).parseFromString(s, 'text/xml');
        }
        return (doc && doc.documentElement && doc.documentElement.tagName != 'parsererror') ? doc : null;
      }
    }
  };
  $.fn.ajaxForm = function (options)
  {
    if (this.length === 0)
    {
      var o = {s: this.selector, c: this.context};
      if (!$.isReady && o.s)
      {
        log('DOM not ready, queuing ajaxForm');
        $(function ()
          {
            $(o.s, o.c).ajaxForm(options);
          });
        return this;
      }
      log('terminating; zero elements found by selector' + ($.isReady ? '' : ' (DOM not ready)'));
      return this;
    }
    return this.ajaxFormUnbind().bind('submit.form-plugin', function (e)
    {
      if (!e.isDefaultPrevented())
      {
        e.preventDefault();
        $(this).ajaxSubmit(options);
      }
    }).bind('click.form-plugin', function (e)
    {
      var target = e.target;
      var $el = $(target);
      if (!($el.is(":submit,input:image")))
      {
        var t = $el.closest(':submit');
        if (t.length == 0)
        {
          return;
        }
        target = t[0];
      }
      var form = this;
      form.clk = target;
      if (target.type == 'image')
      {
        if (e.offsetX != undefined)
        {
          form.clk_x = e.offsetX;
          form.clk_y = e.offsetY;
        }
        else if (typeof $.fn.offset == 'function')
        {
          var offset = $el.offset();
          form.clk_x = e.pageX - offset.left;
          form.clk_y = e.pageY - offset.top;
        }
        else
        {
          form.clk_x = e.pageX - target.offsetLeft;
          form.clk_y = e.pageY - target.offsetTop;
        }
      }
      setTimeout(function ()
                 {
                   form.clk = form.clk_x = form.clk_y = null;
                 }, 100);
    });
  };
  $.fn.ajaxFormUnbind = function ()
  {
    return this.unbind('submit.form-plugin click.form-plugin');
  };
  $.fn.formToArray = function (semantic)
  {
    var a = [];
    if (this.length === 0)
    {
      return a;
    }
    var form = this[0];
    var els = semantic ? form.getElementsByTagName('*') : form.elements;
    if (!els)
    {
      return a;
    }
    var i, j, n, v, el, max, jmax;
    for (i = 0, max = els.length; i < max; i++)
    {
      el = els[i];
      n = el.name;
      if (!n)
      {
        continue;
      }
      if (semantic && form.clk && el.type == "image")
      {
        if (!el.disabled && form.clk == el)
        {
          a.push({name: n, value: $(el).val()});
          a.push({name: n + '.x', value: form.clk_x}, {name: n + '.y', value: form.clk_y});
        }
        continue;
      }
      v = $.fieldValue(el, true);
      if (v && v.constructor == Array)
      {
        for (j = 0, jmax = v.length; j < jmax; j++)
        {
          a.push({name: n, value: v[j]});
        }
      }
      else if (v !== null && typeof v != 'undefined')
      {
        a.push({name: n, value: v});
      }
    }
    if (!semantic && form.clk)
    {
      var $input = $(form.clk), input = $input[0];
      n = input.name;
      if (n && !input.disabled && input.type == 'image')
      {
        a.push({name: n, value: $input.val()});
        a.push({name: n + '.x', value: form.clk_x}, {name: n + '.y', value: form.clk_y});
      }
    }
    return a;
  };
  $.fn.formSerialize = function (semantic)
  {
    return $.param(this.formToArray(semantic));
  };
  $.fn.fieldSerialize = function (successful)
  {
    var a = [];
    this.each(function ()
              {
                var n = this.name;
                if (!n)
                {
                  return;
                }
                var v = $.fieldValue(this, successful);
                if (v && v.constructor == Array)
                {
                  for (var i = 0, max = v.length; i < max; i++)
                  {
                    a.push({name: n, value: v[i]});
                  }
                }
                else if (v !== null && typeof v != 'undefined')
                {
                  a.push({name: this.name, value: v});
                }
              });
    return $.param(a);
  };
  $.fn.fieldValue = function (successful)
  {
    for (var val = [], i = 0, max = this.length; i < max; i++)
    {
      var el = this[i];
      var v = $.fieldValue(el, successful);
      if (v === null || typeof v == 'undefined' || (v.constructor == Array && !v.length))
      {
        continue;
      }
      v.constructor == Array ? $.merge(val, v) : val.push(v);
    }
    return val;
  };
  $.fieldValue = function (el, successful)
  {
    var n = el.name, t = el.type, tag = el.tagName.toLowerCase();
    if (successful === undefined)
    {
      successful = true;
    }
    if (successful && (!n || el.disabled || t == 'reset' || t == 'button' || (t == 'checkbox' || t == 'radio') && !el.checked || (t == 'submit' || t == 'image') && el.form && el.form.clk != el || tag == 'select' && el.selectedIndex == -1))
    {
      return null;
    }
    if (tag == 'select')
    {
      var index = el.selectedIndex;
      if (index < 0)
      {
        return null;
      }
      var a = [], ops = el.options;
      var one = (t == 'select-one');
      var max = (one ? index + 1 : ops.length);
      for (var i = (one ? index : 0); i < max; i++)
      {
        var op = ops[i];
        if (op.selected)
        {
          var v = op.value;
          if (!v)
          {
            v = (op.attributes && op.attributes['value'] && !(op.attributes['value'].specified)) ? op.text : op.value;
          }
          if (one)
          {
            return v;
          }
          a.push(v);
        }
      }
      return a;
    }
    return $(el).val();
  };
  $.fn.clearForm = function ()
  {
    return this.each(function ()
                     {
                       $('input,select,textarea', this).clearFields();
                     });
  };
  $.fn.clearFields = $.fn.clearInputs = function ()
  {
    return this.each(function ()
                     {
                       var t = this.type, tag = this.tagName.toLowerCase();
                       if (t == 'text' || t == 'password' || tag == 'textarea')
                       {
                         this.value = '';
                       }
                       else if (t == 'checkbox' || t == 'radio')
                       {
                         this.checked = false;
                       }
                       else if (tag == 'select')
                       {
                         this.selectedIndex = -1;
                       }
                     });
  };
  $.fn.resetForm = function ()
  {
    return this.each(function ()
                     {
                       if (typeof this.reset == 'function' || (typeof this.reset == 'object' && !this.reset.nodeType))
                       {
                         this.reset();
                       }
                     });
  };
  $.fn.enable = function (b)
  {
    if (b === undefined)
    {
      b = true;
    }
    return this.each(function ()
                     {
                       this.disabled = !b;
                     });
  };
  $.fn.selected = function (select)
  {
    if (select === undefined)
    {
      select = true;
    }
    return this.each(function ()
                     {
                       var t = this.type;
                       if (t == 'checkbox' || t == 'radio')
                       {
                         this.checked = select;
                       }
                       else if (this.tagName.toLowerCase() == 'option')
                       {
                         var $sel = $(this).parent('select');
                         if (select && $sel[0] && $sel[0].type == 'select-one')
                         {
                           $sel.find('option').selected(false);
                         }
                         this.selected = select;
                       }
                     });
  };
  function log()
  {
    if ($.fn.ajaxSubmit.debug)
    {
      var msg = '[jquery.form] ' + Array.prototype.join.call(arguments, '');
      if (window.console && window.console.log)
      {
        window.console.log(msg);
      }
      else if (window.opera && window.opera.postError)
      {
        window.opera.postError(msg);
      }
    }
  };
})(jQuery);
$.wfLive = function (selector, handler, name)
{
  var id = $.wfLive.guid(name);
  if (!$.wfLive.handlers[selector])
  {
    $.wfLive.handlers[selector] = {};
  }
  $.wfLive.handlers[selector][id] = {handler: handler, guid: id};
};
$.extend($.wfLive, {
  _guid: 1, guid: function (name)
  {
    return 'wfLive' + (name || $.wfLive._guid++);
  }, handlers: {}, run: function ()
  {
    $.each($.wfLive.handlers, function (selector, handlers)
    {
      $(selector).each(function (ignored, element)
                       {
                         var jqElement = $(element);
                         $.each(handlers, function (ignored, handlerObj)
                         {
                           if (!jqElement.data(handlerObj.guid))
                           {
                             handlerObj.handler.call(element);
                             jqElement.data(handlerObj.guid, true);
                           }
                         });
                       });
    });
  }
});
$(document).ready(function ()
                  {
                    $.wfLive.run();
                    $('body').ajaxComplete(function ()
                                           {
                                             $.wfLive.run();
                                           });
                  });
$.fn.wfFor = function ()
{
  var target = $(this).data('for') || $(this).attr('for');
  return target ? $('#' + target) : $();
};
$(document).ready(function ()
                  {
                    $('a.wf-toggler, a.wf-closer, a.wf-opener').live('click', function (event)
                    {
                      var self = $(this), target = self.wfFor();
                      event.preventDefault();
                      if (self.hasClass('wf-toggler'))
                      {
                        target.slideToggle();
                      }
                      else if (self.hasClass('wf-opener'))
                      {
                        target.slideDown();
                      }
                      else if (self.hasClass('wf-closer'))
                      {
                        target.slideUp();
                      }
                    });
                    $('a.wf-external-popup').live('click', function (event)
                    {
                      event.preventDefault();
                      var self = $(this), options = {
                        toolbar: self.data('toolbar') || 'no',
                        menubar: self.data('menubar') || 'no',
                        location: self.data('location') || 'yes',
                        width: self.data('width'),
                        height: self.data('height')
                      }, params = '';
                      $.each(options, function (name, value)
                      {
                        params += (params ? ',' : '') + name + '=' + value;
                      });
                      window.open(self.attr('href'), '', params);
                    });
                  });
$.validator.addMethod('pattern', function (value, element, regexp)
{
  if (this.optional(element) || value.length == 0)
  {
    return true;
  }
  if (/^\/.+\/$/.test(regexp))
  {
    regexp = regexp.substr(1, regexp.length - 2);
  }
  return (new RegExp(regexp)).test(value);
}, 'Please check your input.');
$.validator.addMethod('date', function (value, element)
{
  return this.optional(element) || value.length == 0 || !isNaN(new Date(value));
}, 'Please enter a date (MM/DD/YYYY).');
$.validator.addMethod('mindate', function (value, element, mindate)
{
  return this.optional(element) || value.length == 0 || (new Date(mindate) < new Date(value));
}, 'Please enter a date after or on {0}.');
$.validator.addMethod('maxdate', function (value, element, maxdate)
{
  return this.optional(element) || value.length == 0 || (new Date(maxdate) < new Date(value));
}, 'Please enter a date before or on {0}.');
$.validator.addMethod('required', function (value, element, param)
{
  var eElement = $(element);
  if (eElement.is(':hidden') && eElement.hasClass('required'))
  {
    return true;
  }
  if (!this.depend(param, element))
  {
    return "dependency-mismatch";
  }
  switch (element.nodeName.toLowerCase())
  {
    case'select':
      var val = eElement.val();
      return val && val.length > 0;
    case'input':
      if (this.checkable(element))
      {
        return this.getLength(value, element) > 0;
      }
    default:
      return $.trim(value).length > 0;
  }
});
$.wfLive('form.validate', function ()
{
  var form = $(this);
  if ('noValidate'in document.createElement('form'))
  {
    form.attr('noValidate', true);
  }
  form.validate({
                  ignore: '.ignore', errorElement: "div", wrapper: "div", unhighlight: function (element, errorClass, validClass)
    {
      $(element).removeClass(errorClass).addClass(validClass);
    }, errorPlacement: function (error, element)
    {
      var target, offset, maxLeft = 0, type = element.attr('type');
      if (type == 'radio' || type == 'checkbox')
      {
        target = element.parents('.' + type + '_list, .' + type + '-list');
        offset = target.position();
        target.find('label, input').each(function (index, element)
                                         {
                                           var left = $(element).position().left + $(element).outerWidth();
                                           if (left > maxLeft)
                                           {
                                             maxLeft = left;
                                           }
                                         });
        if (maxLeft)
        {
          offset.left = maxLeft;
        }
      }
      else
      {
        target = element;
        offset = target.position();
        offset.left += target.outerWidth();
      }
      error.insertBefore(target).addClass('wf-error-message').css('position', 'absolute');
      offset.top += target.outerHeight() / 2;
      offset.top -= error.outerHeight() / 2;
      error.css('left', offset.left).css('top', offset.top);
    }
                });
});
(function ($)
{
  $.fn.autoResize = function (options)
  {
    var settings = $.extend({
                              onResize: function ()
                              {
                              }, animate: true, animateDuration: 150, animateCallback: function ()
      {
      }, extraSpace: 20, limit: 1000
                            }, options);
    this.filter('textarea').not('ignore').each(function ()
                                               {
                                                 var textarea = $(this);
                                                 if (textarea.is(':hidden'))
                                                 {
                                                   textarea.focus(function ()
                                                                  {
                                                                    textarea.autoResize(options);
                                                                  });
                                                   return;
                                                 }
                                                 textarea.css({resize: 'none', 'overflow-y': 'hidden'});
                                                 var origHeight = textarea.height(), clone = (function ()
                                                 {
                                                   var props = ['height', 'width', 'lineHeight', 'textDecoration', 'letterSpacing'], propOb = {};
                                                   $.each(props, function (i, prop)
                                                   {
                                                     propOb[prop] = textarea.css(prop);
                                                   });
                                                   return textarea.clone().removeAttr('id').removeAttr('name').css({
                                                                                                                     position: 'absolute',
                                                                                                                     top: 0,
                                                                                                                     left: -9999
                                                                                                                   }).css(propOb).attr('tabIndex', '-1').addClass('ignore').insertBefore(textarea);
                                                 })(), lastScrollTop = null, updateSize = function ()
                                                 {
                                                   clone.height(0).val($(this).val()).scrollTop(10000);
                                                   var scrollTop = Math.max(clone.scrollTop(), origHeight) + settings.extraSpace, toChange = $(this).add(clone);
                                                   if (lastScrollTop === scrollTop)
                                                   {
                                                     return;
                                                   }
                                                   lastScrollTop = scrollTop;
                                                   if (scrollTop >= settings.limit)
                                                   {
                                                     $(this).css('overflow-y', '');
                                                     return;
                                                   }
                                                   settings.onResize.call(this);
                                                   settings.animate && textarea.css('display') === 'block' ? toChange.stop().animate({height: scrollTop}, settings.animateDuration, settings.animateCallback) : toChange.height(scrollTop);
                                                 };
                                                 textarea.unbind('.dynSiz').bind('keyup.dynSiz', updateSize).bind('keydown.dynSiz', updateSize).bind('change.dynSiz', updateSize);
                                               });
    return this;
  };
})(jQuery);
$.wfLive('textarea.autosize', function ()
{
  $(this).autoResize().change();
});
function aBlogEnableTitle()
{
  apostrophe.formUpdates({'selector': '#a-blog-item-title-interface', 'update': 'a-blog-title-and-slug'});
  var titleInterface = $('#a-blog-item-title-interface');
  var tControls = titleInterface.find('ul.a-controls');
  var tInput = titleInterface.find('.a-title');
  var originalTitle = tInput.val();
  tInput.keyup(function (event)
               {
                 if (tInput.val().trim() != originalTitle.trim())
                 {
                   titleInterface.addClass('has-changes');
                   tControls.fadeIn();
                 }
                 return false;
               });
  titleInterface.find('.a-cancel').click(function ()
                                         {
                                           tInput.val(originalTitle);
                                           tControls.hide();
                                           return false;
                                         });
}
function aBlogEnableSlug()
{
  apostrophe.formUpdates({'selector': '#a-blog-item-permalink-interface', 'update': 'a-blog-title-and-slug'});
  var slugInterface = $('#a-blog-item-permalink-interface');
  var tControls = slugInterface.find('ul.a-controls');
  var tInput = slugInterface.find('.a-slug');
  var originalSlug = tInput.val();
  tInput.keyup(function (event)
               {
                 if (tInput.val().trim() != originalSlug.trim())
                 {
                   slugInterface.addClass('has-changes');
                   tControls.fadeIn();
                 }
                 return false;
               });
  slugInterface.find('.a-cancel').click(function ()
                                        {
                                          tInput.val(originalSlug);
                                          tControls.hide();
                                          return false;
                                        });
}
function aBlogUpdateComments(enabled, feedback)
{
  if (enabled)
  {
    $('.section.comments .allow_comments_toggle').addClass('enabled').removeClass('disabled');
  }
  else
  {
    $('.section.comments .allow_comments_toggle').addClass('disabled').removeClass('enabled');
  }
}
function aBlogEnableNewForm()
{
  var newForm = $('.a-blog-admin-new-form');
  newForm.submit(function ()
                 {
                   var form = $(this);
                   apostrophe.updating('.a-blog-admin-new-ajax');
                   $.post(form.attr('action'), $(this).serialize(), function (data)
                   {
                     $(document).append(data);
                   });
                   return false;
                 });
}
function aBlogEnableForm(options)
{
  var changed = false;
  var savedState = null;
  var form = $('#a-admin-form');
  apostrophe.formUpdates({selector: '#a-admin-form', update: 'a-admin-form'});
  $('.a-subnav-wrapper').addClass('a-ajax-attach-updating');
  var status = form.find('[name="a_blog_item[publication]"]');
  var init = true;

  function find(sel)
  {
    return form.find(sel);
  }

  status.change(function ()
                {
                  var c = form.find('.a-published-at-container');
                  var s = status.val();
                  if (s === 'schedule')
                  {
                    c.show();
                  }
                  else
                  {
                    c.hide();
                  }
                  if (!init)
                  {
                    find('.a-save-blog-main .label').text(options['update-labels'][s]);
                  }
                  init = false;
                });
  status.change();
  find('.template.section select').change(function ()
                                          {
                                            alert(options['template-change-warning']);
                                            $(form).unbind('submit.aFormUpdates');
                                          });
  find('.post-editors-toggle').click(function ()
                                     {
                                       find('.post-editors-options').show();
                                       find('.post-editors-toggle').hide();
                                       return false;
                                     });
  var p = {'choose-one': options['editors-choose-label']};
  aMultipleSelect('#editors-section', p);
  p = {'choose-one': options['categories-choose-label']};
  if (options['categories-add'])
  {
    p['add'] = options['categories-add-label'];
  }
  aMultipleSelect(form.find('#categories-section'), p);
  function toggleAllDay(checkbox)
  {
    $(checkbox).toggleClass('all_day_enabled');
    find('.start_time').toggleClass('time_disabled').toggle();
    find('.end_time').toggleClass('time_disabled').toggle();
  }

  find('.all_day input[type=checkbox]').bind('click', function ()
  {
    toggleAllDay($(this));
  });
  if (find('.all_day input[type=checkbox]:checked').length)
  {
    toggleAllDay($(this));
  }
}
function aBlogGetPostStatus()
{
  var postStatus = $('#a_blog_item_status');
  return postStatus.val();
}
function aBlogConstructor()
{
  this.sidebarEnhancements = function (options)
  {
    var debug = options['debug'];
    debug ? apostrophe.log('aBlog.sidebarEnhancements -- debug') : '';
    $('.a-tag-sidebar-title.all-tags').click(function ()
                                             {
                                               $('.a-tag-sidebar-list.all-tags').slideToggle();
                                               $(this).toggleClass('open');
                                             });
    $('.a-tag-sidebar-title.all-tags').hover(function ()
                                             {
                                               $(this).toggleClass('over');
                                             }, function ()
                                             {
                                               $(this).toggleClass('over');
                                             });
  }
  this.slotEditView = function (options)
  {
    var formName = options['formName'];
    var autocompleteUrl = options['autocompleteUrl'];
    var className = options['class'];
    var selfLabelSelector = options['selfLabelSelector'];
    var debug = (options['debug']) ? options['debug'] : false;
    (debug) ? apostrophe.log('aBlog.slotEditView -- formName: ' + formName) : '';
    (debug) ? apostrophe.log('aBlog.slotEditView -- autocompleteUrl: ' + autocompleteUrl) : '';
    (debug) ? apostrophe.log('aBlog.slotEditView -- class: ' + className) : '';
    aMultipleSelect('#a-' + formName + ' .' + className, {'autocomplete': autocompleteUrl});
    aMultipleSelect('#a-' + formName + ' .categories', {'choose-one': 'Add Categories'});
    var slotEditForm = $('#a-' + formName)
    var editStates = slotEditForm.find('.a-form-row.by-type input[type="radio"]');
    var editState = slotEditForm.find('.a-form-row.by-type input[type="radio"]:checked').val();
    slotEditForm.addClass('a-ui a-options dropshadow editState-' + editState);
    editStates.live('click', function ()
    {
      editState = slotEditForm.find('.a-form-row.by-type input[type="radio"]:checked').val();
      slotEditForm.removeClass('editState-title').removeClass('editState-tags').addClass('editState-' + editState);
    });
  }
}
window.aBlog = new aBlogConstructor();
jQuery(function ($)
       {
         $.fn.tallest = function ()
         {
           return this._extremities({'aspect': 'height', 'max': true})[0]
         };
         $.fn.tallestSize = function ()
         {
           return this._extremities({'aspect': 'height', 'max': true})[1]
         };
         $.fn.shortest = function ()
         {
           return this._extremities({'aspect': 'height', 'max': false})[0]
         };
         $.fn.shortestSize = function ()
         {
           return this._extremities({'aspect': 'height', 'max': false})[1]
         };
         $.fn.widest = function ()
         {
           return this._extremities({'aspect': 'width', 'max': true})[0]
         };
         $.fn.widestSize = function ()
         {
           return this._extremities({'aspect': 'width', 'max': true})[1]
         };
         $.fn.thinnest = function ()
         {
           return this._extremities({'aspect': 'width', 'max': false})[0]
         };
         $.fn.thinnestSize = function ()
         {
           return this._extremities({'aspect': 'width', 'max': false})[1]
         };
         $.fn._extremities = function (options)
         {
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
         $.fn.animateHighlight = function (highlightColor, duration)
         {
           var highlightBg = highlightColor || "#FFFF9C", animateMs = duration || 2500, originalBg = this.css('backgroundColor');
           this.css('background-color', highlightBg).animate({backgroundColor: originalBg}, animateMs);
         };
         $.fn.customFadeIn = function (speed, callback)
         {
           $(this).fadeIn(speed, function ()
           {
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
         $.fn.customFadeOut = function (speed, callback)
         {
           $(this).fadeOut(speed, function ()
           {
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
function fsConstructor()
{
  this.fixSpotlightHeights = function ()
  {
    $.each(['.a-slot.spotlight'], function (index, selector)
    {
      var processed = {}, items = $(selector);
      items.height('auto');
      items.each(function ()
                 {
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
  this.createServicesPuzzle = function ()
  {
    var services = $('#services-puzzle'), positions = {1: 'first', 2: 'second', 3: 'third', 4: 'fourth'};

    function refreshPositions()
    {
      var pos = 1;
      services.find('.puzzle-piece').each(function ()
                                          {
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
                        update: function (event, ui)
                        {
                          refreshPositions();
                          var color;
                          services.find('.puzzle-piece').each(function (index)
                                                              {
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
    services.bind('solved', function ()
    {
      var solvedMessage = services.find('.solved-message'), images = services.find('.puzzle-piece .switch'), contents = services.find('.puzzle-piece-content');
      services.sortable('disable');
      services.addClass('solved');
      contents.hide();
      solvedMessage.css({'visibility': 'visible'});
      images.animate({opacity: .75}, 2500);
      setTimeout(function ()
                 {
                   contents.customFadeIn(2000);
                   images.animate({opacity: .08}, 2000);
                 }, 3000);
      services.find('.pieces css3-container').hide();
      services.find('a.reset').click(function ()
                                     {
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
  this.observeFeedbackForms = function ()
  {
    $('.wf-feedback-form').each(function ()
                                {
                                  var form = $(this);
                                  form.ajaxForm({
                                                  dataType: 'json', beforeSubmit: function ()
                                    {
                                      form.find('.a-btn.a-submit').removeClass('a-email').addClass('a-busy');
                                    }, success: function (json)
                                    {
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
                                    }, error: function ()
                                    {
                                      alert('Issue with submission. Please email team@flickswitch.cc with your message.');
                                    }
                                                });
                                });
  }
  this.prettifyRegister = function ()
  {
    if (!this._prettifyRegistered)
    {
      $(document).ready(function ()
                        {
                          prettyPrint();
                        });
      this._prettifyRegistered = true;
    }
  }
  this.prettifyLiveEdit = function (selector)
  {
    var prettyElement = $(selector), textarea = prettyElement.closest('form').find('textarea');
    prettyPrint();
    setInterval(function ()
                {
                  if (prettyElement.html() != textarea.val())
                  {
                    prettyElement.html(textarea.val());
                    prettyPrint();
                  }
                }, 1000);
  }
  this.observeSlides = function (selector)
  {
    var container = $(selector), buttons = container.find('.pager .a-btn');
    buttons.click(function ()
                  {
                    var button = $(this), slide = button.data('slide');
                    buttons.removeClass('active');
                    button.addClass('active');
                    container.find('.slide').hide();
                    container.find('.slide-' + slide).show();
                  })
  }
}
window.fs = new fsConstructor();
$.wfLive('input[data-placeholder]', function ()
{
  aInputSelfLabel(this, $(this).data('placeholder'));
});
window['PR_SHOULD_USE_CONTINUATION'] = true;
window['PR_TAB_WIDTH'] = 8;
window['PR_normalizedHtml'] = window['PR'] = window['prettyPrintOne'] = window['prettyPrint'] = void 0;
window['_pr_isIE6'] = function ()
{
  var ieVersion = navigator && navigator.userAgent && navigator.userAgent.match(/\bMSIE ([678])\./);
  ieVersion = ieVersion ? +ieVersion[1] : false;
  window['_pr_isIE6'] = function ()
  {
    return ieVersion;
  };
  return ieVersion;
};
(function ()
{
  var FLOW_CONTROL_KEYWORDS = "break continue do else for if return while ";
  var C_KEYWORDS = FLOW_CONTROL_KEYWORDS + "auto case char const default " + "double enum extern float goto int long register short signed sizeof " + "static struct switch typedef union unsigned void volatile ";
  var COMMON_KEYWORDS = C_KEYWORDS + "catch class delete false import " + "new operator private protected public this throw true try typeof ";
  var CPP_KEYWORDS = COMMON_KEYWORDS + "alignof align_union asm axiom bool " + "concept concept_map const_cast constexpr decltype " + "dynamic_cast explicit export friend inline late_check " + "mutable namespace nullptr reinterpret_cast static_assert static_cast " + "template typeid typename using virtual wchar_t where ";
  var JAVA_KEYWORDS = COMMON_KEYWORDS + "abstract boolean byte extends final finally implements import " + "instanceof null native package strictfp super synchronized throws " + "transient ";
  var CSHARP_KEYWORDS = JAVA_KEYWORDS + "as base by checked decimal delegate descending event " + "fixed foreach from group implicit in interface internal into is lock " + "object out override orderby params partial readonly ref sbyte sealed " + "stackalloc string select uint ulong unchecked unsafe ushort var ";
  var JSCRIPT_KEYWORDS = COMMON_KEYWORDS + "debugger eval export function get null set undefined var with " + "Infinity NaN ";
  var PERL_KEYWORDS = "caller delete die do dump elsif eval exit foreach for " + "goto if import last local my next no our print package redo require " + "sub undef unless until use wantarray while BEGIN END ";
  var PYTHON_KEYWORDS = FLOW_CONTROL_KEYWORDS + "and as assert class def del " + "elif except exec finally from global import in is lambda " + "nonlocal not or pass print raise try with yield " + "False True None ";
  var RUBY_KEYWORDS = FLOW_CONTROL_KEYWORDS + "alias and begin case class def" + " defined elsif end ensure false in module next nil not or redo rescue " + "retry self super then true undef unless until when yield BEGIN END ";
  var SH_KEYWORDS = FLOW_CONTROL_KEYWORDS + "case done elif esac eval fi " + "function in local set then until ";
  var ALL_KEYWORDS = (CPP_KEYWORDS + CSHARP_KEYWORDS + JSCRIPT_KEYWORDS + PERL_KEYWORDS +
  PYTHON_KEYWORDS + RUBY_KEYWORDS + SH_KEYWORDS);
  var PR_STRING = 'str';
  var PR_KEYWORD = 'kwd';
  var PR_COMMENT = 'com';
  var PR_TYPE = 'typ';
  var PR_LITERAL = 'lit';
  var PR_PUNCTUATION = 'pun';
  var PR_PLAIN = 'pln';
  var PR_TAG = 'tag';
  var PR_DECLARATION = 'dec';
  var PR_SOURCE = 'src';
  var PR_ATTRIB_NAME = 'atn';
  var PR_ATTRIB_VALUE = 'atv';
  var PR_NOCODE = 'nocode';
  var REGEXP_PRECEDER_PATTERN = function ()
  {
    var preceders = ["!", "!=", "!==", "#", "%", "%=", "&", "&&", "&&=", "&=", "(", "*", "*=", "+=", ",", "-=", "->", "/", "/=", ":", "::", ";", "<", "<<", "<<=", "<=", "=", "==", "===", ">", ">=", ">>", ">>=", ">>>", ">>>=", "?", "@", "[", "^", "^=", "^^", "^^=", "{", "|", "|=", "||", "||=", "~", "break", "case", "continue", "delete", "do", "else", "finally", "instanceof", "return", "throw", "try", "typeof"];
    var pattern = '(?:^^|[+-]';
    for (var i = 0; i < preceders.length; ++i)
    {
      pattern += '|' + preceders[i].replace(/([^=<>:&a-z])/g, '\\$1');
    }
    pattern += ')\\s*';
    return pattern;
  }();
  var pr_amp = /&/g;
  var pr_lt = /</g;
  var pr_gt = />/g;
  var pr_quot = /\"/g;

  function attribToHtml(str)
  {
    return str.replace(pr_amp, '&amp;').replace(pr_lt, '&lt;').replace(pr_gt, '&gt;').replace(pr_quot, '&quot;');
  }

  function textToHtml(str)
  {
    return str.replace(pr_amp, '&amp;').replace(pr_lt, '&lt;').replace(pr_gt, '&gt;');
  }

  var pr_ltEnt = /&lt;/g;
  var pr_gtEnt = /&gt;/g;
  var pr_aposEnt = /&apos;/g;
  var pr_quotEnt = /&quot;/g;
  var pr_ampEnt = /&amp;/g;
  var pr_nbspEnt = /&nbsp;/g;

  function htmlToText(html)
  {
    var pos = html.indexOf('&');
    if (pos < 0)
    {
      return html;
    }
    for (--pos; (pos = html.indexOf('&#', pos + 1)) >= 0;)
    {
      var end = html.indexOf(';', pos);
      if (end >= 0)
      {
        var num = html.substring(pos + 3, end);
        var radix = 10;
        if (num && num.charAt(0) === 'x')
        {
          num = num.substring(1);
          radix = 16;
        }
        var codePoint = parseInt(num, radix);
        if (!isNaN(codePoint))
        {
          html = (html.substring(0, pos) + String.fromCharCode(codePoint) +
          html.substring(end + 1));
        }
      }
    }
    return html.replace(pr_ltEnt, '<').replace(pr_gtEnt, '>').replace(pr_aposEnt, "'").replace(pr_quotEnt, '"').replace(pr_nbspEnt, ' ').replace(pr_ampEnt, '&');
  }

  function isRawContent(node)
  {
    return 'XMP' === node.tagName;
  }

  var newlineRe = /[\r\n]/g;

  function isPreformatted(node, content)
  {
    if ('PRE' === node.tagName)
    {
      return true;
    }
    if (!newlineRe.test(content))
    {
      return true;
    }
    var whitespace = '';
    if (node.currentStyle)
    {
      whitespace = node.currentStyle.whiteSpace;
    }
    else if (window.getComputedStyle)
    {
      whitespace = window.getComputedStyle(node, null).whiteSpace;
    }
    return !whitespace || whitespace === 'pre';
  }

  function normalizedHtml(node, out, opt_sortAttrs)
  {
    switch (node.nodeType)
    {
      case 1:
        var name = node.tagName.toLowerCase();
        out.push('<', name);
        var attrs = node.attributes;
        var n = attrs.length;
        if (n)
        {
          if (opt_sortAttrs)
          {
            var sortedAttrs = [];
            for (var i = n; --i >= 0;)
            {
              sortedAttrs[i] = attrs[i];
            }
            sortedAttrs.sort(function (a, b)
                             {
                               return (a.name < b.name) ? -1 : a.name === b.name ? 0 : 1;
                             });
            attrs = sortedAttrs;
          }
          for (var i = 0; i < n; ++i)
          {
            var attr = attrs[i];
            if (!attr.specified)
            {
              continue;
            }
            out.push(' ', attr.name.toLowerCase(), '="', attribToHtml(attr.value), '"');
          }
        }
        out.push('>');
        for (var child = node.firstChild; child; child = child.nextSibling)
        {
          normalizedHtml(child, out, opt_sortAttrs);
        }
        if (node.firstChild || !/^(?:br|link|img)$/.test(name))
        {
          out.push('<\/', name, '>');
        }
        break;
      case 3:
      case 4:
        out.push(textToHtml(node.nodeValue));
        break;
    }
  }

  function combinePrefixPatterns(regexs)
  {
    var capturedGroupIndex = 0;
    var needToFoldCase = false;
    var ignoreCase = false;
    for (var i = 0, n = regexs.length; i < n; ++i)
    {
      var regex = regexs[i];
      if (regex.ignoreCase)
      {
        ignoreCase = true;
      }
      else if (/[a-z]/i.test(regex.source.replace(/\\u[0-9a-f]{4}|\\x[0-9a-f]{2}|\\[^ux]/gi, '')))
      {
        needToFoldCase = true;
        ignoreCase = false;
        break;
      }
    }
    function decodeEscape(charsetPart)
    {
      if (charsetPart.charAt(0) !== '\\')
      {
        return charsetPart.charCodeAt(0);
      }
      switch (charsetPart.charAt(1))
      {
        case'b':
          return 8;
        case't':
          return 9;
        case'n':
          return 0xa;
        case'v':
          return 0xb;
        case'f':
          return 0xc;
        case'r':
          return 0xd;
        case'u':
        case'x':
          return parseInt(charsetPart.substring(2), 16) || charsetPart.charCodeAt(1);
        case'0':
        case'1':
        case'2':
        case'3':
        case'4':
        case'5':
        case'6':
        case'7':
          return parseInt(charsetPart.substring(1), 8);
        default:
          return charsetPart.charCodeAt(1);
      }
    }

    function encodeEscape(charCode)
    {
      if (charCode < 0x20)
      {
        return (charCode < 0x10 ? '\\x0' : '\\x') + charCode.toString(16);
      }
      var ch = String.fromCharCode(charCode);
      if (ch === '\\' || ch === '-' || ch === '[' || ch === ']')
      {
        ch = '\\' + ch;
      }
      return ch;
    }

    function caseFoldCharset(charSet)
    {
      var charsetParts = charSet.substring(1, charSet.length - 1).match(new RegExp('\\\\u[0-9A-Fa-f]{4}'
                                                                                   + '|\\\\x[0-9A-Fa-f]{2}'
                                                                                   + '|\\\\[0-3][0-7]{0,2}'
                                                                                   + '|\\\\[0-7]{1,2}'
                                                                                   + '|\\\\[\\s\\S]'
                                                                                   + '|-'
                                                                                   + '|[^-\\\\]', 'g'));
      var groups = [];
      var ranges = [];
      var inverse = charsetParts[0] === '^';
      for (var i = inverse ? 1 : 0, n = charsetParts.length; i < n; ++i)
      {
        var p = charsetParts[i];
        switch (p)
        {
          case'\\B':
          case'\\b':
          case'\\D':
          case'\\d':
          case'\\S':
          case'\\s':
          case'\\W':
          case'\\w':
            groups.push(p);
            continue;
        }
        var start = decodeEscape(p);
        var end;
        if (i + 2 < n && '-' === charsetParts[i + 1])
        {
          end = decodeEscape(charsetParts[i + 2]);
          i += 2;
        }
        else
        {
          end = start;
        }
        ranges.push([start, end]);
        if (!(end < 65 || start > 122))
        {
          if (!(end < 65 || start > 90))
          {
            ranges.push([Math.max(65, start) | 32, Math.min(end, 90) | 32]);
          }
          if (!(end < 97 || start > 122))
          {
            ranges.push([Math.max(97, start) & ~32, Math.min(end, 122) & ~32]);
          }
        }
      }
      ranges.sort(function (a, b)
                  {
                    return (a[0] - b[0]) || (b[1] - a[1]);
                  });
      var consolidatedRanges = [];
      var lastRange = [NaN, NaN];
      for (var i = 0; i < ranges.length; ++i)
      {
        var range = ranges[i];
        if (range[0] <= lastRange[1] + 1)
        {
          lastRange[1] = Math.max(lastRange[1], range[1]);
        }
        else
        {
          consolidatedRanges.push(lastRange = range);
        }
      }
      var out = ['['];
      if (inverse)
      {
        out.push('^');
      }
      out.push.apply(out, groups);
      for (var i = 0; i < consolidatedRanges.length; ++i)
      {
        var range = consolidatedRanges[i];
        out.push(encodeEscape(range[0]));
        if (range[1] > range[0])
        {
          if (range[1] + 1 > range[0])
          {
            out.push('-');
          }
          out.push(encodeEscape(range[1]));
        }
      }
      out.push(']');
      return out.join('');
    }

    function allowAnywhereFoldCaseAndRenumberGroups(regex)
    {
      var parts = regex.source.match(new RegExp('(?:'
                                                + '\\[(?:[^\\x5C\\x5D]|\\\\[\\s\\S])*\\]'
                                                + '|\\\\u[A-Fa-f0-9]{4}'
                                                + '|\\\\x[A-Fa-f0-9]{2}'
                                                + '|\\\\[0-9]+'
                                                + '|\\\\[^ux0-9]'
                                                + '|\\(\\?[:!=]'
                                                + '|[\\(\\)\\^]'
                                                + '|[^\\x5B\\x5C\\(\\)\\^]+'
                                                + ')', 'g'));
      var n = parts.length;
      var capturedGroups = [];
      for (var i = 0, groupIndex = 0; i < n; ++i)
      {
        var p = parts[i];
        if (p === '(')
        {
          ++groupIndex;
        }
        else if ('\\' === p.charAt(0))
        {
          var decimalValue = +p.substring(1);
          if (decimalValue && decimalValue <= groupIndex)
          {
            capturedGroups[decimalValue] = -1;
          }
        }
      }
      for (var i = 1; i < capturedGroups.length; ++i)
      {
        if (-1 === capturedGroups[i])
        {
          capturedGroups[i] = ++capturedGroupIndex;
        }
      }
      for (var i = 0, groupIndex = 0; i < n; ++i)
      {
        var p = parts[i];
        if (p === '(')
        {
          ++groupIndex;
          if (capturedGroups[groupIndex] === undefined)
          {
            parts[i] = '(?:';
          }
        }
        else if ('\\' === p.charAt(0))
        {
          var decimalValue = +p.substring(1);
          if (decimalValue && decimalValue <= groupIndex)
          {
            parts[i] = '\\' + capturedGroups[groupIndex];
          }
        }
      }
      for (var i = 0, groupIndex = 0; i < n; ++i)
      {
        if ('^' === parts[i] && '^' !== parts[i + 1])
        {
          parts[i] = '';
        }
      }
      if (regex.ignoreCase && needToFoldCase)
      {
        for (var i = 0; i < n; ++i)
        {
          var p = parts[i];
          var ch0 = p.charAt(0);
          if (p.length >= 2 && ch0 === '[')
          {
            parts[i] = caseFoldCharset(p);
          }
          else if (ch0 !== '\\')
          {
            parts[i] = p.replace(/[a-zA-Z]/g, function (ch)
            {
              var cc = ch.charCodeAt(0);
              return '[' + String.fromCharCode(cc & ~32, cc | 32) + ']';
            });
          }
        }
      }
      return parts.join('');
    }

    var rewritten = [];
    for (var i = 0, n = regexs.length; i < n; ++i)
    {
      var regex = regexs[i];
      if (regex.global || regex.multiline)
      {
        throw new Error('' + regex);
      }
      rewritten.push('(?:' + allowAnywhereFoldCaseAndRenumberGroups(regex) + ')');
    }
    return new RegExp(rewritten.join('|'), ignoreCase ? 'gi' : 'g');
  }

  var PR_innerHtmlWorks = null;

  function getInnerHtml(node)
  {
    if (null === PR_innerHtmlWorks)
    {
      var testNode = document.createElement('PRE');
      testNode.appendChild(document.createTextNode('<!DOCTYPE foo PUBLIC "foo bar">\n<foo />'));
      PR_innerHtmlWorks = !/</.test(testNode.innerHTML);
    }
    if (PR_innerHtmlWorks)
    {
      var content = node.innerHTML;
      if (isRawContent(node))
      {
        content = textToHtml(content);
      }
      else if (!isPreformatted(node, content))
      {
        content = content.replace(/(<br\s*\/?>)[\r\n]+/g, '$1').replace(/(?:[\r\n]+[ \t]*)+/g, ' ');
      }
      return content;
    }
    var out = [];
    for (var child = node.firstChild; child; child = child.nextSibling)
    {
      normalizedHtml(child, out);
    }
    return out.join('');
  }

  function makeTabExpander(tabWidth)
  {
    var SPACES = '                ';
    var charInLine = 0;
    return function (plainText)
    {
      var out = null;
      var pos = 0;
      for (var i = 0, n = plainText.length; i < n; ++i)
      {
        var ch = plainText.charAt(i);
        switch (ch)
        {
          case'\t':
            if (!out)
            {
              out = [];
            }
            out.push(plainText.substring(pos, i));
            var nSpaces = tabWidth - (charInLine % tabWidth);
            charInLine += nSpaces;
            for (; nSpaces >= 0; nSpaces -= SPACES.length)
            {
              out.push(SPACES.substring(0, nSpaces));
            }
            pos = i + 1;
            break;
          case'\n':
            charInLine = 0;
            break;
          default:
            ++charInLine;
        }
      }
      if (!out)
      {
        return plainText;
      }
      out.push(plainText.substring(pos));
      return out.join('');
    };
  }

  var pr_chunkPattern = new RegExp('[^<]+'
                                   + '|<\!--[\\s\\S]*?--\>'
                                   + '|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>'
                                   + '|<\/?[a-zA-Z](?:[^>\"\']|\'[^\']*\'|\"[^\"]*\")*>'
                                   + '|<', 'g');
  var pr_commentPrefix = /^<\!--/;
  var pr_cdataPrefix = /^<!\[CDATA\[/;
  var pr_brPrefix = /^<br\b/i;
  var pr_tagNameRe = /^<(\/?)([a-zA-Z][a-zA-Z0-9]*)/;

  function extractTags(s)
  {
    var matches = s.match(pr_chunkPattern);
    var sourceBuf = [];
    var sourceBufLen = 0;
    var extractedTags = [];
    if (matches)
    {
      for (var i = 0, n = matches.length; i < n; ++i)
      {
        var match = matches[i];
        if (match.length > 1 && match.charAt(0) === '<')
        {
          if (pr_commentPrefix.test(match))
          {
            continue;
          }
          if (pr_cdataPrefix.test(match))
          {
            sourceBuf.push(match.substring(9, match.length - 3));
            sourceBufLen += match.length - 12;
          }
          else if (pr_brPrefix.test(match))
          {
            sourceBuf.push('\n');
            ++sourceBufLen;
          }
          else
          {
            if (match.indexOf(PR_NOCODE) >= 0 && isNoCodeTag(match))
            {
              var name = match.match(pr_tagNameRe)[2];
              var depth = 1;
              var j;
              end_tag_loop:for (j = i + 1; j < n; ++j)
              {
                var name2 = matches[j].match(pr_tagNameRe);
                if (name2 && name2[2] === name)
                {
                  if (name2[1] === '/')
                  {
                    if (--depth === 0)
                    {
                      break end_tag_loop;
                    }
                  }
                  else
                  {
                    ++depth;
                  }
                }
              }
              if (j < n)
              {
                extractedTags.push(sourceBufLen, matches.slice(i, j + 1).join(''));
                i = j;
              }
              else
              {
                extractedTags.push(sourceBufLen, match);
              }
            }
            else
            {
              extractedTags.push(sourceBufLen, match);
            }
          }
        }
        else
        {
          var literalText = htmlToText(match);
          sourceBuf.push(literalText);
          sourceBufLen += literalText.length;
        }
      }
    }
    return {source: sourceBuf.join(''), tags: extractedTags};
  }

  function isNoCodeTag(tag)
  {
    return !!tag.replace(/\s(\w+)\s*=\s*(?:\"([^\"]*)\"|'([^\']*)'|(\S+))/g, ' $1="$2$3$4"').match(/[cC][lL][aA][sS][sS]=\"[^\"]*\bnocode\b/);
  }

  function appendDecorations(basePos, sourceCode, langHandler, out)
  {
    if (!sourceCode)
    {
      return;
    }
    var job = {source: sourceCode, basePos: basePos};
    langHandler(job);
    out.push.apply(out, job.decorations);
  }

  function createSimpleLexer(shortcutStylePatterns, fallthroughStylePatterns)
  {
    var shortcuts = {};
    var tokenizer;
    (function ()
    {
      var allPatterns = shortcutStylePatterns.concat(fallthroughStylePatterns);
      var allRegexs = [];
      var regexKeys = {};
      for (var i = 0, n = allPatterns.length; i < n; ++i)
      {
        var patternParts = allPatterns[i];
        var shortcutChars = patternParts[3];
        if (shortcutChars)
        {
          for (var c = shortcutChars.length; --c >= 0;)
          {
            shortcuts[shortcutChars.charAt(c)] = patternParts;
          }
        }
        var regex = patternParts[1];
        var k = '' + regex;
        if (!regexKeys.hasOwnProperty(k))
        {
          allRegexs.push(regex);
          regexKeys[k] = null;
        }
      }
      allRegexs.push(/[\0-\uffff]/);
      tokenizer = combinePrefixPatterns(allRegexs);
    })();
    var nPatterns = fallthroughStylePatterns.length;
    var notWs = /\S/;
    var decorate = function (job)
    {
      var sourceCode = job.source, basePos = job.basePos;
      var decorations = [basePos, PR_PLAIN];
      var pos = 0;
      var tokens = sourceCode.match(tokenizer) || [];
      var styleCache = {};
      for (var ti = 0, nTokens = tokens.length; ti < nTokens; ++ti)
      {
        var token = tokens[ti];
        var style = styleCache[token];
        var match = void 0;
        var isEmbedded;
        if (typeof style === 'string')
        {
          isEmbedded = false;
        }
        else
        {
          var patternParts = shortcuts[token.charAt(0)];
          if (patternParts)
          {
            match = token.match(patternParts[1]);
            style = patternParts[0];
          }
          else
          {
            for (var i = 0; i < nPatterns; ++i)
            {
              patternParts = fallthroughStylePatterns[i];
              match = token.match(patternParts[1]);
              if (match)
              {
                style = patternParts[0];
                break;
              }
            }
            if (!match)
            {
              style = PR_PLAIN;
            }
          }
          isEmbedded = style.length >= 5 && 'lang-' === style.substring(0, 5);
          if (isEmbedded && !(match && typeof match[1] === 'string'))
          {
            isEmbedded = false;
            style = PR_SOURCE;
          }
          if (!isEmbedded)
          {
            styleCache[token] = style;
          }
        }
        var tokenStart = pos;
        pos += token.length;
        if (!isEmbedded)
        {
          decorations.push(basePos + tokenStart, style);
        }
        else
        {
          var embeddedSource = match[1];
          var embeddedSourceStart = token.indexOf(embeddedSource);
          var embeddedSourceEnd = embeddedSourceStart + embeddedSource.length;
          if (match[2])
          {
            embeddedSourceEnd = token.length - match[2].length;
            embeddedSourceStart = embeddedSourceEnd - embeddedSource.length;
          }
          var lang = style.substring(5);
          appendDecorations(basePos + tokenStart, token.substring(0, embeddedSourceStart), decorate, decorations);
          appendDecorations(basePos + tokenStart + embeddedSourceStart, embeddedSource, langHandlerForExtension(lang, embeddedSource), decorations);
          appendDecorations(basePos + tokenStart + embeddedSourceEnd, token.substring(embeddedSourceEnd), decorate, decorations);
        }
      }
      job.decorations = decorations;
    };
    return decorate;
  }

  function sourceDecorator(options)
  {
    var shortcutStylePatterns = [], fallthroughStylePatterns = [];
    if (options['tripleQuotedStrings'])
    {
      shortcutStylePatterns.push([PR_STRING, /^(?:\'\'\'(?:[^\'\\]|\\[\s\S]|\'{1,2}(?=[^\']))*(?:\'\'\'|$)|\"\"\"(?:[^\"\\]|\\[\s\S]|\"{1,2}(?=[^\"]))*(?:\"\"\"|$)|\'(?:[^\\\']|\\[\s\S])*(?:\'|$)|\"(?:[^\\\"]|\\[\s\S])*(?:\"|$))/, null, '\'"']);
    }
    else if (options['multiLineStrings'])
    {
      shortcutStylePatterns.push([PR_STRING, /^(?:\'(?:[^\\\']|\\[\s\S])*(?:\'|$)|\"(?:[^\\\"]|\\[\s\S])*(?:\"|$)|\`(?:[^\\\`]|\\[\s\S])*(?:\`|$))/, null, '\'"`']);
    }
    else
    {
      shortcutStylePatterns.push([PR_STRING, /^(?:\'(?:[^\\\'\r\n]|\\.)*(?:\'|$)|\"(?:[^\\\"\r\n]|\\.)*(?:\"|$))/, null, '"\'']);
    }
    if (options['verbatimStrings'])
    {
      fallthroughStylePatterns.push([PR_STRING, /^@\"(?:[^\"]|\"\")*(?:\"|$)/, null]);
    }
    if (options['hashComments'])
    {
      if (options['cStyleComments'])
      {
        shortcutStylePatterns.push([PR_COMMENT, /^#(?:(?:define|elif|else|endif|error|ifdef|include|ifndef|line|pragma|undef|warning)\b|[^\r\n]*)/, null, '#']);
        fallthroughStylePatterns.push([PR_STRING, /^<(?:(?:(?:\.\.\/)*|\/?)(?:[\w-]+(?:\/[\w-]+)+)?[\w-]+\.h|[a-z]\w*)>/, null]);
      }
      else
      {
        shortcutStylePatterns.push([PR_COMMENT, /^#[^\r\n]*/, null, '#']);
      }
    }
    if (options['cStyleComments'])
    {
      fallthroughStylePatterns.push([PR_COMMENT, /^\/\/[^\r\n]*/, null]);
      fallthroughStylePatterns.push([PR_COMMENT, /^\/\*[\s\S]*?(?:\*\/|$)/, null]);
    }
    if (options['regexLiterals'])
    {
      var REGEX_LITERAL = ('/(?=[^/*])'
      + '(?:[^/\\x5B\\x5C]'
      + '|\\x5C[\\s\\S]'
      + '|\\x5B(?:[^\\x5C\\x5D]|\\x5C[\\s\\S])*(?:\\x5D|$))+'
      + '/');
      fallthroughStylePatterns.push(['lang-regex', new RegExp('^' + REGEXP_PRECEDER_PATTERN + '(' + REGEX_LITERAL + ')')]);
    }
    var keywords = options['keywords'].replace(/^\s+|\s+$/g, '');
    if (keywords.length)
    {
      fallthroughStylePatterns.push([PR_KEYWORD, new RegExp('^(?:' + keywords.replace(/\s+/g, '|') + ')\\b'), null]);
    }
    shortcutStylePatterns.push([PR_PLAIN, /^\s+/, null, ' \r\n\t\xA0']);
    fallthroughStylePatterns.push([PR_LITERAL, /^@[a-z_$][a-z_$@0-9]*/i, null], [PR_TYPE, /^@?[A-Z]+[a-z][A-Za-z_$@0-9]*/, null], [PR_PLAIN, /^[a-z_$][a-z_$@0-9]*/i, null], [PR_LITERAL, new RegExp('^(?:'
                                                                                                                                                                                                     + '0x[a-f0-9]+'
                                                                                                                                                                                                     + '|(?:\\d(?:_\\d+)*\\d*(?:\\.\\d*)?|\\.\\d\\+)'
                                                                                                                                                                                                     + '(?:e[+\\-]?\\d+)?'
                                                                                                                                                                                                     + ')'
                                                                                                                                                                                                     + '[a-z]*', 'i'), null, '0123456789'], [PR_PUNCTUATION, /^.[^\s\w\.$@\'\"\`\/\#]*/, null]);
    return createSimpleLexer(shortcutStylePatterns, fallthroughStylePatterns);
  }

  var decorateSource = sourceDecorator({
                                         'keywords': ALL_KEYWORDS,
                                         'hashComments': true,
                                         'cStyleComments': true,
                                         'multiLineStrings': true,
                                         'regexLiterals': true
                                       });

  function recombineTagsAndDecorations(job)
  {
    var sourceText = job.source;
    var extractedTags = job.extractedTags;
    var decorations = job.decorations;
    var html = [];
    var outputIdx = 0;
    var openDecoration = null;
    var currentDecoration = null;
    var tagPos = 0;
    var decPos = 0;
    var tabExpander = makeTabExpander(window['PR_TAB_WIDTH']);
    var adjacentSpaceRe = /([\r\n ]) /g;
    var startOrSpaceRe = /(^| ) /gm;
    var newlineRe = /\r\n?|\n/g;
    var trailingSpaceRe = /[ \r\n]$/;
    var lastWasSpace = true;
    var isIE678 = window['_pr_isIE6']();
    var lineBreakHtml = (isIE678 ? (job.sourceNode.tagName === 'PRE' ? (isIE678 === 6 ? '&#160;\r\n' : isIE678 === 7 ? '&#160;<br>\r' : '&#160;\r') : '&#160;<br />') : '<br />');
    var numberLines = job.sourceNode.className.match(/\blinenums\b(?::(\d+))?/);
    var lineBreaker;
    if (numberLines)
    {
      var lineBreaks = [];
      for (var i = 0; i < 10; ++i)
      {
        lineBreaks[i] = lineBreakHtml + '</li><li class="L' + i + '">';
      }
      var lineNum = numberLines[1] && numberLines[1].length ? numberLines[1] - 1 : 0;
      html.push('<ol class="linenums"><li class="L', (lineNum) % 10, '"');
      if (lineNum)
      {
        html.push(' value="', lineNum + 1, '"');
      }
      html.push('>');
      lineBreaker = function ()
      {
        var lb = lineBreaks[++lineNum % 10];
        return openDecoration ? ('</span>' + lb + '<span class="' + openDecoration + '">') : lb;
      };
    }
    else
    {
      lineBreaker = lineBreakHtml;
    }
    function emitTextUpTo(sourceIdx)
    {
      if (sourceIdx > outputIdx)
      {
        if (openDecoration && openDecoration !== currentDecoration)
        {
          html.push('</span>');
          openDecoration = null;
        }
        if (!openDecoration && currentDecoration)
        {
          openDecoration = currentDecoration;
          html.push('<span class="', openDecoration, '">');
        }
        var htmlChunk = textToHtml(tabExpander(sourceText.substring(outputIdx, sourceIdx))).replace(lastWasSpace ? startOrSpaceRe : adjacentSpaceRe, '$1&#160;');
        lastWasSpace = trailingSpaceRe.test(htmlChunk);
        html.push(htmlChunk.replace(newlineRe, lineBreaker));
        outputIdx = sourceIdx;
      }
    }

    while (true)
    {
      var outputTag;
      if (tagPos < extractedTags.length)
      {
        if (decPos < decorations.length)
        {
          outputTag = extractedTags[tagPos] <= decorations[decPos];
        }
        else
        {
          outputTag = true;
        }
      }
      else
      {
        outputTag = false;
      }
      if (outputTag)
      {
        emitTextUpTo(extractedTags[tagPos]);
        if (openDecoration)
        {
          html.push('</span>');
          openDecoration = null;
        }
        html.push(extractedTags[tagPos + 1]);
        tagPos += 2;
      }
      else if (decPos < decorations.length)
      {
        emitTextUpTo(decorations[decPos]);
        currentDecoration = decorations[decPos + 1];
        decPos += 2;
      }
      else
      {
        break;
      }
    }
    emitTextUpTo(sourceText.length);
    if (openDecoration)
    {
      html.push('</span>');
    }
    if (numberLines)
    {
      html.push('</li></ol>');
    }
    job.prettyPrintedHtml = html.join('');
  }

  var langHandlerRegistry = {};

  function registerLangHandler(handler, fileExtensions)
  {
    for (var i = fileExtensions.length; --i >= 0;)
    {
      var ext = fileExtensions[i];
      if (!langHandlerRegistry.hasOwnProperty(ext))
      {
        langHandlerRegistry[ext] = handler;
      }
      else if ('console'in window)
      {
        console['warn']('cannot override language handler %s', ext);
      }
    }
  }

  function langHandlerForExtension(extension, source)
  {
    if (!(extension && langHandlerRegistry.hasOwnProperty(extension)))
    {
      extension = /^\s*</.test(source) ? 'default-markup' : 'default-code';
    }
    return langHandlerRegistry[extension];
  }

  registerLangHandler(decorateSource, ['default-code']);
  registerLangHandler(createSimpleLexer([], [[PR_PLAIN, /^[^<?]+/], [PR_DECLARATION, /^<!\w[^>]*(?:>|$)/], [PR_COMMENT, /^<\!--[\s\S]*?(?:-\->|$)/], ['lang-', /^<\?([\s\S]+?)(?:\?>|$)/], ['lang-', /^<%([\s\S]+?)(?:%>|$)/], [PR_PUNCTUATION, /^(?:<[%?]|[%?]>)/], ['lang-', /^<xmp\b[^>]*>([\s\S]+?)<\/xmp\b[^>]*>/i], ['lang-js', /^<script\b[^>]*>([\s\S]*?)(<\/script\b[^>]*>)/i], ['lang-css', /^<style\b[^>]*>([\s\S]*?)(<\/style\b[^>]*>)/i], ['lang-in.tag', /^(<\/?[a-z][^<>]*>)/i]]), ['default-markup', 'htm', 'html', 'mxml', 'xhtml', 'xml', 'xsl']);
  registerLangHandler(createSimpleLexer([[PR_PLAIN, /^[\s]+/, null, ' \t\r\n'], [PR_ATTRIB_VALUE, /^(?:\"[^\"]*\"?|\'[^\']*\'?)/, null, '\"\'']], [[PR_TAG, /^^<\/?[a-z](?:[\w.:-]*\w)?|\/?>$/i], [PR_ATTRIB_NAME, /^(?!style[\s=]|on)[a-z](?:[\w:-]*\w)?/i], ['lang-uq.val', /^=\s*([^>\'\"\s]*(?:[^>\'\"\s\/]|\/(?=\s)))/], [PR_PUNCTUATION, /^[=<>\/]+/], ['lang-js', /^on\w+\s*=\s*\"([^\"]+)\"/i], ['lang-js', /^on\w+\s*=\s*\'([^\']+)\'/i], ['lang-js', /^on\w+\s*=\s*([^\"\'>\s]+)/i], ['lang-css', /^style\s*=\s*\"([^\"]+)\"/i], ['lang-css', /^style\s*=\s*\'([^\']+)\'/i], ['lang-css', /^style\s*=\s*([^\"\'>\s]+)/i]]), ['in.tag']);
  registerLangHandler(createSimpleLexer([], [[PR_ATTRIB_VALUE, /^[\s\S]+/]]), ['uq.val']);
  registerLangHandler(sourceDecorator({
                                        'keywords': CPP_KEYWORDS,
                                        'hashComments': true,
                                        'cStyleComments': true
                                      }), ['c', 'cc', 'cpp', 'cxx', 'cyc', 'm']);
  registerLangHandler(sourceDecorator({'keywords': 'null true false'}), ['json']);
  registerLangHandler(sourceDecorator({
                                        'keywords': CSHARP_KEYWORDS,
                                        'hashComments': true,
                                        'cStyleComments': true,
                                        'verbatimStrings': true
                                      }), ['cs']);
  registerLangHandler(sourceDecorator({'keywords': JAVA_KEYWORDS, 'cStyleComments': true}), ['java']);
  registerLangHandler(sourceDecorator({'keywords': SH_KEYWORDS, 'hashComments': true, 'multiLineStrings': true}), ['bsh', 'csh', 'sh']);
  registerLangHandler(sourceDecorator({
                                        'keywords': PYTHON_KEYWORDS,
                                        'hashComments': true,
                                        'multiLineStrings': true,
                                        'tripleQuotedStrings': true
                                      }), ['cv', 'py']);
  registerLangHandler(sourceDecorator({
                                        'keywords': PERL_KEYWORDS,
                                        'hashComments': true,
                                        'multiLineStrings': true,
                                        'regexLiterals': true
                                      }), ['perl', 'pl', 'pm']);
  registerLangHandler(sourceDecorator({
                                        'keywords': RUBY_KEYWORDS,
                                        'hashComments': true,
                                        'multiLineStrings': true,
                                        'regexLiterals': true
                                      }), ['rb']);
  registerLangHandler(sourceDecorator({'keywords': JSCRIPT_KEYWORDS, 'cStyleComments': true, 'regexLiterals': true}), ['js']);
  registerLangHandler(createSimpleLexer([], [[PR_STRING, /^[\s\S]+/]]), ['regex']);
  function applyDecorator(job)
  {
    var sourceCodeHtml = job.sourceCodeHtml;
    var opt_langExtension = job.langExtension;
    job.prettyPrintedHtml = sourceCodeHtml;
    try
    {
      var sourceAndExtractedTags = extractTags(sourceCodeHtml);
      var source = sourceAndExtractedTags.source;
      job.source = source;
      job.basePos = 0;
      job.extractedTags = sourceAndExtractedTags.tags;
      langHandlerForExtension(opt_langExtension, source)(job);
      recombineTagsAndDecorations(job);
    }
    catch (e)
    {
      if ('console'in window)
      {
        console['log'](e && e['stack'] ? e['stack'] : e);
      }
    }
  }

  function prettyPrintOne(sourceCodeHtml, opt_langExtension)
  {
    var job = {sourceCodeHtml: sourceCodeHtml, langExtension: opt_langExtension};
    applyDecorator(job);
    return job.prettyPrintedHtml;
  }

  function prettyPrint(opt_whenDone)
  {
    function byTagName(tn)
    {
      return document.getElementsByTagName(tn);
    }

    var codeSegments = [byTagName('pre'), byTagName('code'), byTagName('xmp')];
    var elements = [];
    for (var i = 0; i < codeSegments.length; ++i)
    {
      for (var j = 0, n = codeSegments[i].length; j < n; ++j)
      {
        elements.push(codeSegments[i][j]);
      }
    }
    codeSegments = null;
    var clock = Date;
    if (!clock['now'])
    {
      clock = {
        'now': function ()
        {
          return (new Date).getTime();
        }
      };
    }
    var k = 0;
    var prettyPrintingJob;

    function doWork()
    {
      var endTime = (window['PR_SHOULD_USE_CONTINUATION'] ? clock.now() + 250 : Infinity);
      for (; k < elements.length && clock.now() < endTime; k++)
      {
        var cs = elements[k];
        if (cs.className && cs.className.indexOf('prettyprint') >= 0)
        {
          var langExtension = cs.className.match(/\blang-(\w+)\b/);
          if (langExtension)
          {
            langExtension = langExtension[1];
          }
          var nested = false;
          for (var p = cs.parentNode; p; p = p.parentNode)
          {
            if ((p.tagName === 'pre' || p.tagName === 'code' || p.tagName === 'xmp') && p.className && p.className.indexOf('prettyprint') >= 0)
            {
              nested = true;
              break;
            }
          }
          if (!nested)
          {
            var content = getInnerHtml(cs);
            content = content.replace(/(?:\r\n?|\n)$/, '');
            prettyPrintingJob = {sourceCodeHtml: content, langExtension: langExtension, sourceNode: cs};
            applyDecorator(prettyPrintingJob);
            replaceWithPrettyPrintedHtml();
          }
        }
      }
      if (k < elements.length)
      {
        setTimeout(doWork, 250);
      }
      else if (opt_whenDone)
      {
        opt_whenDone();
      }
    }

    function replaceWithPrettyPrintedHtml()
    {
      var newContent = prettyPrintingJob.prettyPrintedHtml;
      if (!newContent)
      {
        return;
      }
      var cs = prettyPrintingJob.sourceNode;
      if (!isRawContent(cs))
      {
        cs.innerHTML = newContent;
      }
      else
      {
        var pre = document.createElement('PRE');
        for (var i = 0; i < cs.attributes.length; ++i)
        {
          var a = cs.attributes[i];
          if (a.specified)
          {
            var aname = a.name.toLowerCase();
            if (aname === 'class')
            {
              pre.className = a.value;
            }
            else
            {
              pre.setAttribute(a.name, a.value);
            }
          }
        }
        pre.innerHTML = newContent;
        cs.parentNode.replaceChild(pre, cs);
        cs = pre;
      }
    }

    doWork();
  }

  window['PR_normalizedHtml'] = normalizedHtml;
  window['prettyPrintOne'] = prettyPrintOne;
  window['prettyPrint'] = prettyPrint;
  window['PR'] = {
    'combinePrefixPatterns': combinePrefixPatterns,
    'createSimpleLexer': createSimpleLexer,
    'registerLangHandler': registerLangHandler,
    'sourceDecorator': sourceDecorator,
    'PR_ATTRIB_NAME': PR_ATTRIB_NAME,
    'PR_ATTRIB_VALUE': PR_ATTRIB_VALUE,
    'PR_COMMENT': PR_COMMENT,
    'PR_DECLARATION': PR_DECLARATION,
    'PR_KEYWORD': PR_KEYWORD,
    'PR_LITERAL': PR_LITERAL,
    'PR_NOCODE': PR_NOCODE,
    'PR_PLAIN': PR_PLAIN,
    'PR_PUNCTUATION': PR_PUNCTUATION,
    'PR_SOURCE': PR_SOURCE,
    'PR_STRING': PR_STRING,
    'PR_TAG': PR_TAG,
    'PR_TYPE': PR_TYPE
  };
})();
