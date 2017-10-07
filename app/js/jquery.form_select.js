import $ from 'jquery';
import plugin from './jquery.plugin';
import random_id from './random_id';

class form_select {
  constructor(element) {
    const $select = $(element);

    // Create virtual wrappers objects
    let $wrap = $('<div>', {class: 'b-form-select-wrap js-form-select-wrap'});
    let $dropdown = $('<div>', {class: 'b-form-select-dropdown js-form-select-dropdown'});

    // Process select options
    $select.find("option").each(function() {
      let $option = $(this);
      let select_option_id = random_id();
      let text = $option.val();

      // Set random id for a select option
      $option.attr('data-x-select-option', select_option_id);

      let params = {
        class: 'b-form-select-dropdown-option js-form-select-dropdown-option',
        'data-x-select-option': select_option_id,
        type: 'button',
        text
      };

      if ($option.prop('selected')) {
        params['data-x-selected-by-default'] = true;
      }

      // Create a dropdown item
      $dropdown.append( $('<button>', params));
    });

    // Wrap all into a DOM element
    $wrap = $select.add($dropdown).wrapAll($wrap)
    // ...and replace wrapper variable with this DOM element
      .parent();

    // Create a selected tags container in DOM
    $('<div>', {class: 'b-form-select-selected js-form-select-selected'}).prependTo($wrap);

    // Check if options are selected
    $.fn.x__is_filled = function () {
      let $wrap = this.closest('.js-form-select-wrap');

      if ($wrap.find(".js-form-select option:selected").length) {
        $wrap.addClass('filled');
      } else {
        $wrap.removeClass('filled');
      }

      return this;
    };

    // Process dropdown elements
    $.fn.x__process_dropdown_element = function () {
      this.hide();

      let
        select_option_id = this.data('x-select-option'),
        text = this.text();

      let
        $wrap = this.closest('.js-form-select-wrap'),
        $select = $wrap.find('.js-form-select'),
        $select_selected = $wrap.find('.js-form-select-selected'),
        $dropdown = $wrap.find('.js-form-select-dropdown'),
        $select_option = $select.find(`option[data-x-select-option=${select_option_id}]`);

      // Change value of a real select>option
      $select_option.prop('selected', true);

      // Create a layout of a selected item
      let
        $selected_option = $('<div>', {
          class: 'b-form-select-selected-option js-form-select-selected-option',
          text
        }),
        $selected_option_remove = $('<button>', {
          class: 'b-form-select-selected-option-remove js-form-select-selected-option-remove',
          'data-x-select-option': select_option_id,
          type: 'button',
          text: '✕'
        }).data('x-select-option', select_option_id);

      $selected_option
        .append($selected_option_remove)
        .appendTo($select_selected);

      // Process selected elements
      $selected_option_remove.on('click', function () {
        let $this = $(this);
        let id = $this.data('x-select-option');

        $this.parent().remove();

        $select.find(`option[data-x-select-option=${id}]`).prop('selected', false);
        $dropdown.find(`[data-x-select-option=${id}]`).show();

        $select.x__is_filled();
      });

      $select.x__is_filled();
      return this;
    };

    // Process dropdown initially selected options
    $dropdown.find('.js-form-select-dropdown-option[data-x-selected-by-default]').x__process_dropdown_element();

    // Process dropdown elements on click
    $dropdown.find('.js-form-select-dropdown-option').on('click', function() {
      $(this).x__process_dropdown_element();
    });
  }
}

// Toggle dropdowns
$('body').on('click', function (event) {
  let $wraps = $('.js-form-select-wrap');

  // console.log("$wraps.length:", $wraps.length);
  // console.log("event.target:", event.target);

  if ( !$wraps.length ) {
    return false;
  }

  let $target = $(event.target);
  let $wrap;

  // Check if click on a target should not close a dropdown
  if ( $target.hasClass('js-form-select-selected')
    || $target.hasClass('js-form-select-dropdown')
    || $target.hasClass('js-form-select-dropdown-option')
    || $target.hasClass('js-form-select-selected-option')
    || $target.hasClass('js-form-select-selected-option-remove') ) {

    // Fix unexpected dropdown close when a remove button is clicked
    if ( $target.hasClass('js-form-select-selected-option-remove') ) {
      return;
    }

    $wrap = $target.closest('.js-form-select-wrap');
  }

  // Open a dropdown
  if ( $target.is('.js-form-select-selected') ) {
    $wrap.toggleClass('opened');
  }

  // Close other dropdowns
  $('.js-form-select-wrap.opened').not($wrap)
    .removeClass('opened');
});

plugin('form_select', form_select);
