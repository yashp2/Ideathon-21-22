const view = {
  registrationForm: document.getElementById('registrationForm'),
  currentFormTab: 0,
  displayFormTab: function(formTabs, currentTab, tabChange) {
    const newTab = currentTab + tabChange;
    const nextButton = view.registrationForm.elements['nextTab'];
    const previousButton = view.registrationForm.elements['previousTab'];
    const submitButton = view.registrationForm.elements['registrationSubmit'];
    view.currentFormTab = newTab;
    
    formTabs[currentTab].classList.remove('active');
    formTabs[newTab].classList.add('active');
    if(newTab == 0) {
      nextButton.classList.add('active');
      previousButton.classList.remove('active');
      submitButton.classList.remove('active');
    }
    else if(view.currentFormTab < formTabs.length-1) {
      nextButton.classList.add('active');
      previousButton.classList.add('active');
      submitButton.classList.remove('active');
    } else {
      submitButton.classList.add('active');
      previousButton.classList.add('active');
      nextButton.classList.remove('active');
    }
  },
  
  // Get custom error message from 'customMessages' based on the type of error.
  getCustomErrorMessage: function(type, validity, customMessages) {
    if(validity.typeMismatch) {
      return customMessages[`${type}Mismatch`];
    } else {
      for(const invalidKey in customMessages) {
        if(validity[invalidKey]) {
          const customMessage = invalidKey === 'tooShort' ? customMessages[invalidKey][type] : customMessages[invalidKey]
          return customMessage;
        }
      }
    }
  },
  // Check element's validity on input and return an appropriate error message if invalid.
  checkInputValidity: function(input, customMessages) {
    // 'confirmPassword' doesn't need a pattern since 'password' already has one. It is checked manually by comparing it to 'password'.
    if(input.name == 'registrationConfirmPassword') {
      view.validatePassword(customMessages);
    } 
    else if(!input.validity.valid) {
      const message = view.getCustomErrorMessage(input.type, input.validity, customMessages);
      const errorMessageLabel = input.parentElement.querySelector('.form-error-message');
      errorMessageLabel.textContent = message;
      input.classList.add('invalid');
    }
    else if (input.validity.valid) {
      input.classList.remove('invalid');
    }
  },
  // Check validity of the whole current form tab before displaying a new tab/submitting the form.
  checkTabValidity: function(formTabs) {
    const currentTabInputs = document.querySelectorAll('form.active .form-tab.active > div > input');
    let validInputs = 0;
    currentTabInputs.forEach(function(input) {
      // Check if input is valid. If it isn't, the 'invalid' event listener runs the 'checkInputValidity' function.
      input.checkValidity();
      if(input.validity.valid) {
        validInputs++;
      }
    });
    if(validInputs == currentTabInputs.length) {
      view.currentFormTab < formTabs.length-1 ? view.displayFormTab(formTabs, view.currentFormTab, 1) : view.registrationForm.submit();
    }
  },
  // By default, the first form button is set as 'active'. Get its width and apply it to button border width.
  setFormSelectBorder: function() {
    const button = document.querySelector('.form-select button.active');
    const formSelectBorder = formSelect.querySelector('.border');
    const buttonRect = button.getBoundingClientRect();
    formSelectBorder.style.width = buttonRect.width + 'px';
  },
  setUpEventListeners: function() {
    const formSelect = document.getElementById('formSelect');
    const formSelectButtons = formSelect.querySelectorAll('button');
    const formSelectBorder = formSelect.querySelector('.border');
    const forms = document.querySelectorAll('form');
    const inputs = document.querySelectorAll('input, select, textarea');
    const registrationInputs = document.querySelectorAll('#registrationForm input, select, textarea');
    const errorLabels = document.querySelectorAll('.form-error-message');
    const registrationPassword = view.registrationForm.elements['registrationPassword'];
    const registrationFormTabs = view.registrationForm.getElementsByClassName('form-tab');
    const registrationSubmitSection = document.getElementById('registrationSubmitSection');
    const loginSubmitSection = document.getElementById('loginSubmitSection');
    const customMessages = {
      valueMissing: 'Please fill out this field', // if 'required' input is empty
      emailMismatch: 'Invalid email format', // invalid email
      patternMismatch: 'Invalid input', // invalid pattern
      tooShort: {
        password: 'Enter at least 6 characters' // password not long enough
      }
    }
    
    // Add 'active' class to a clicked form selection button.
    formSelect.addEventListener('click', function(e) {
      if(e.target.tagName == 'BUTTON') {
        formSelectButtons.forEach(function(button) {
          button.classList.remove('active');
        })
        e.target.classList.add('active');
        const buttonRect = e.target.getBoundingClientRect();
        const formSelectRect = formSelect.getBoundingClientRect();
        const leftPos = buttonRect.left - formSelectRect.left;
        formSelectBorder.style.left = leftPos + 'px';
        formSelectBorder.style.width = buttonRect.width + 'px';
        forms.forEach(function(form) {
          form.classList.remove('active');
        });
        const activeForm = document.getElementById(e.target.dataset.form);
        activeForm.classList.add('active');
      }
    });
    
    inputs.forEach(function(input) {
      // Only add floating label to inputs that are text, email or password.
      if(input.type == 'text' || input.type == 'email' || input.type == 'password') {
        input.addEventListener('focus', function(e) {
          input.nextElementSibling.classList.add('label-float');
        });
        input.addEventListener('focusout', function(e) {
          if(!input.value) {
            input.nextElementSibling.classList.remove('label-float');
          }
        });
      }
    })

    registrationInputs.forEach(function(input) {
      input.addEventListener('input', function(e) {
        view.checkInputValidity(input, customMessages);
      });
      input.addEventListener('invalid', function(e) {
        view.checkInputValidity(input, customMessages);
      });
    });
    
    
    registrationSubmitSection.addEventListener('click', function(e) {
      if(e.target.name == 'nextTab' || e.target.name == 'registrationSubmit') {
        view.checkTabValidity(registrationFormTabs);
      }
      else if(e.target.name == 'previousTab') {
        view.displayFormTab(registrationFormTabs, view.currentFormTab, -1);
      }
    });
    
    loginSubmitSection.addEventListener('click', function(e) {
      if(e.target.name == 'loginSubmit') {
        document.getElementById('loginForm').submit();
      }
    });
    
    view.registrationForm.addEventListener('submit', function(e) {
      e.preventDefault();
    });
    
    // On 'enter' key press, prevent the form from being submitted and run 'checkTabValidity' instead.
    view.registrationForm.addEventListener('keypress', function(e) {
      if(e.keyCode == 13) {
        e.preventDefault();
        view.checkTabValidity(registrationFormTabs);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', function(e) {
  view.setUpEventListeners();
});

window.addEventListener('load', function(e) {
  view.setFormSelectBorder();
});


