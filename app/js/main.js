import "./jquery.form_select";
import "bootstrap/js/tooltip";

$(function(){
  // Bootstrap tooltip
  $('[data-toggle="tooltip"]').tooltip();

  // Process inputs
  $('.js-form-input').each(function () {
    let $this = $(this);

    setInterval(function () {
      if ( $this.val() ) {
        $this.addClass('filled');
      } else {
        $this.removeClass('filled');
      }
    }, 100);
  });

  $('.js-form-select').form_select();

  $.fn.form_check_name = function () {
    let $first = $('input[name=first-name]');
    let $last = $('input[name=last-name]');

    if ( this.is(':checked') ) {
      $first.prop('disabled', true).val('Claire');
      $last.prop('disabled', true).val('Jackson');
    } else {
      $first.add($last).prop('disabled', false);
    }

    return this;
  };

  $('.js-check-name')
    .form_check_name()
    .on('change', function () {
      $(this).form_check_name();
    });
});