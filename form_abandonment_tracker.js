var FormAbandonmentTracker = {
  init: function(gtag, form_id, event_category, event_action = 'FormAbandonment') {
    this.$gtag = gtag;
    this.$eventCategory = event_category ? event_category : form_id;
    this.$eventAction = event_action;

    this.$formHistory = [];
    this.$formIsSubmitted = false;
    this.$formId = form_id;
    this.$form = document.getElementById(form_id);

    if(!gtag) {
      console.error("FormTracker Error: Please pass in your gtag object when initializing FormTracker.");
      return;
    }
    if(!this.$form) {
      console.error("FormTracker Error: Please specify the correct form id when initializing FormTracker.");
      return;
    }
    this.attachEvents();
  },
  attachEvents: function() {
    let that = this;
    this.$form.querySelectorAll('select').forEach(function(el) {
      el.addEventListener('change', function(e) { return that.onFieldChange(e); });
    });
    this.$form.querySelectorAll('input, textarea').forEach(function(el) {
      el.addEventListener('input', function(e) { return that.onFieldInput(e); });
    });
    this.$form.addEventListener('submit', function(e) { return that.onFormSubmit() });
    window.addEventListener('beforeunload', function(e) { return that.onFormAbandonment() } );
  },
  onFieldChange: function(event) {
    let field_id = event.target.id;
    this.addFieldToHistory(field_id);
  },
  onFieldInput: function(event) {
    let field_id = event.target.id;
    this.addFieldToHistory(field_id);
  },
  addFieldToHistory: function(field_id) {
    this.$formHistory.push(field_id);
    this.$formHistory = this.$formHistory.filter((v, i, a) => a.indexOf(v) === i).sort();
  },
  onFormSubmit: function() {
    this.$formIsSubmitted = true;
    this.clearFormHistory();
  },
  onFormAbandonment: function() {
    if(!this.$formIsSubmitted) {
      this.sendEvents();
    }
  },
  sendEvents: function() {
    let joined_history = this.$formHistory.join(', ');
    // Send the data off to Google
    this.$gtag('event', this.$eventAction, {
      'event_category': this.$eventCategory,
      'event_label': 'Fields with input: ' + joined_history,
      'event_callback': function() {
        console.log("Data sent to Google.");
      }
    });
  },
  clearFormHistory: function() {
    this.$formHistory = [];
  }
}
