//document.getElementById("defaultOpen").click();
var flag = false;
var imageInfo;
$(document).ready(function () {
  let result = document.querySelector('.result'),
    img_result = document.querySelector('.img-result'),
    img_w = document.querySelector('.img-w'),
    img_h = document.querySelector('.img-h'),
    options = document.querySelector('.options'),
    save = document.querySelector('.save'),
    actionssave = document.querySelector('.actionssave'),

    cropped = document.querySelector('.cropped'),
    dwn = document.querySelector('#btnSubmit'),
    upload = document.querySelector('#file-input'),
    cropper = '';

  // on change show image with crop options
  upload.addEventListener('change', (e) => {

    if (e.target.files.length) {
      // start file reader
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target.result) {
          // create new image
          let img = document.createElement('img');
          img.id = 'image';
          img.src = e.target.result
          // clean result before
          result.innerHTML = '';
          // append new image
          result.appendChild(img);
          // show save btn and options
          save.classList.remove('hide');
          actionssave.classList.remove('hide');
          options.classList.remove('hide');
          // init cropper
          cropper = new Cropper(img);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  });

  // save on click
  save.addEventListener('click', (e) => {
    e.preventDefault();
    // get result to data uri
    let imgSrc = cropper.getCroppedCanvas({
      width: img_w.value // input value
    }).toDataURL();
    // remove hide class of img
    cropped.classList.remove('hide');
    img_result.classList.remove('hide');
    // show image cropped
    cropped.src = imgSrc;
    imageInfo = imgSrc;
    //console.log("ddddddddddddddddddddddddd" + imgSrc)
    dwn.classList.remove('hide');

  });


  // Options
  actions.querySelector('.docs-toggles').onchange = function (event) {
    var e = event || window.event;
    var target = e.target || e.srcElement;
    var cropBoxData;
    var canvasData;
    var isCheckbox;
    var isRadio;

    if (!cropper) {
      return;
    }

    if (target.tagName.toLowerCase() === 'label') {
      target = target.querySelector('input');
    }

    isCheckbox = target.type === 'checkbox';
    isRadio = target.type === 'radio';

    if (isCheckbox || isRadio) {
      if (isCheckbox) {
        options[target.name] = target.checked;
        cropBoxData = cropper.getCropBoxData();
        canvasData = cropper.getCanvasData();

        options.ready = function () {
          //console.log('ready');
          cropper.setCropBoxData(cropBoxData).setCanvasData(canvasData);
        };
      } else {
        options[target.name] = target.value;
        options.ready = function () {
          //console.log('ready');
        };
      }

      // Restart
      cropper.destroy();
      cropper = new Cropper(image, options);
    }
  };

  // Methods
  actions.querySelector('.docs-buttons').onclick = function (event) {
    var e = event || window.event;
    var target = e.target || e.srcElement;
    var cropped;
    var result;
    var input;
    var data;

    if (!cropper) {
      return;
    }

    while (target !== this) {
      if (target.getAttribute('data-method')) {
        break;
      }

      target = target.parentNode;
    }

    if (target === this || target.disabled || target.className.indexOf('disabled') > -1) {
      return;
    }

    data = {
      method: target.getAttribute('data-method'),
      target: target.getAttribute('data-target'),
      option: target.getAttribute('data-option') || undefined,
      secondOption: target.getAttribute('data-second-option') || undefined
    };

    cropped = cropper.cropped;

    if (data.method) {
      if (typeof data.target !== 'undefined') {
        input = document.querySelector(data.target);

        if (!target.hasAttribute('data-option') && data.target && input) {
          try {
            data.option = JSON.parse(input.value);
          } catch (e) {
            //console.log(e.message);
          }
        }
      }

      switch (data.method) {
        case 'rotate':
          if (cropped && options.viewMode > 0) {
            cropper.clear();
          }

          break;

        case 'getCroppedCanvas':
          try {
            data.option = JSON.parse(data.option);
          } catch (e) {
            //console.log(e.message);
          }

          // if (uploadedImageType === 'image/jpeg') {
          //   if (!data.option) {
          //     data.option = {};
          //   }

          //   data.option.fillColor = 'transparent';
          // }

          break;
      }

      result = cropper[data.method](data.option, data.secondOption);

      switch (data.method) {
        case 'rotate':
          if (cropped && options.viewMode > 0) {
            cropper.crop();
          }

          break;

        case 'scaleX':
        case 'scaleY':
          target.setAttribute('data-option', -data.option);
          break;

          // case 'getCroppedCanvas':
          //   if (result) {
          //     // Bootstrap's Modal
          //     $('#getCroppedCanvasModal').modal().find('.modal-body').html(result);

          //     if (!download.disabled) {
          //       download.download = uploadedImageName;
          //       download.href = result.toDataURL(uploadedImageType);
          //     }
          //   }

          //   break;

        case 'destroy':
          cropper = null;

          if (uploadedImageURL) {
            URL.revokeObjectURL(uploadedImageURL);
            uploadedImageURL = '';
            image.src = originalImageURL;
          }

          break;
      }

      if (typeof result === 'object' && result !== cropper && input) {
        try {
          input.value = JSON.stringify(result);
        } catch (e) {
          //console.log(e.message);
        }
      }
    }
  };

});


$("#btnSubmit").click(function (event) {
  GlobalLoadershow();
  //stop submit the form, we will post it manually.
  event.preventDefault();
  //alert('hello dear');
  fire_ajax_submitTest(imageInfo);

});



function readURL(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function (e) {
      $('#blah').attr('src', e.target.result);
    }

    reader.readAsDataURL(input.files[0]);
  }
}

$("#imgInp").change(function () {
  readURL(this);
});


function fire_ajax_submitTest(imageInfo) {

  var loggedUser = JSON.parse(sessionStorage.getItem("LOGGED_IN_USER"));
  var formData = $('#fileUploadForm').serializeToJSON();
  formData["advisorId"] = loggedUser.id;
  //  //console.log('imageInfo' + imageInfo)
  formData["croppedImageData"] = imageInfo;
  var data = JSON.stringify(formData);

  $.ajax({
    async: false,
    url: ClientServiceUrl + "logo/cropped/upload",
    method: "POST",
    data: data,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Authorization', "Bearer " + sessionStorage.getItem("sessionID"));
    },
    contentType: "application/json; charset=utf-8",
    success: function (data) {
      alert(data);
      $.ajax({
        url: ClientServiceUrl + "getadvisor/logo/" + loggedUser.id,
        type: "GET",
        contentType: "image/jpeg",
        dataType: "text",
        beforeSend: function (xhr) {
          xhr.setRequestHeader('Authorization', "Bearer " + sessionStorage.getItem("sessionID"));
        },
        success: function (data) {
          if (data != "") {
            $("#idBussinessHeaderAdvisorLogo").attr('src', 'data:image/jpeg;base64,' + data);
          } else {
            $("#idBussinessHeaderAdvisorLogo").attr('src', '../Common/assets/images/newlogo.png');
          }
        }
      });
      GlobalLoaderhide();
    },
    error: function (jqXHR, exception) {
      GlobalLoaderhide();
      var msg = '';
      if (jqXHR.status === 0) {
        msg = 'Could not connect to the server, please contact System Administrator.';
      } else if (jqXHR.status == 400) {
        msg = 'There is some problem in the server, please contact System Administrator.\n';
      } else if (jqXHR.status == 401) {
        var error, error_description;
        error = jqXHR.responseJSON.error_description;
        error_description = "Access token expired: " + sessionStorage.getItem("sessionID");
        if (error === error_description) {
          msg = "Your session has expired.Please log in again"
          bootbox.alert({
            message: msg,
            callback: function () {
              window.location = "../index.html";
            }
          });
        }
        if (error === "unauthorized") {
          msg = "Full authentication is required to access this resource",
            bootbox.alert({
              message: msg
            });
        }
      } else if (jqXHR.status == 403) {
        msg = 'you don’t have permission to access ‘/’ on this server.';
      } else if (jqXHR.status == 404) {
        msg = 'Requested service url not found.';
      } else if (jqXHR.status == 500) {
        msg = 'There is some problem in the server, please contact System Administrator.\n';
      } else if (exception === 'parsererror') {
        msg = 'Failed to get result.';
      } else if (exception === 'timeout') {
        msg = 'Timed Out!';
      } else if (exception === 'abort') {
        msg = 'Request aborted.';
      } else {
        msg = 'Something went wrong, could not connect to the server, please contact System Administrator.\n';
      }
    }
  });



}

function openCity(evt, cityName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(cityName).style.display = "block";
  evt.currentTarget.className += " active";
}