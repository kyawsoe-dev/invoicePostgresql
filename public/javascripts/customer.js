$(document).ready(function() {
    $('#addCustomerForm').submit(function(e) {
      e.preventDefault();
      var form = $(this)[0];
      var formData = new FormData(form);
      $.ajax({
          url: '/api/customer/createpage',
          type: 'POST',
          data: formData,
          contentType: false,
          processData: false,
          success: function(response) {
              Swal.fire({
                  icon: "success",
                  title: "Customer Created Successfully !!",
                  showConfirmButton: false,
                  timer: 1500,
              }).then((result) => {
                  if (result.dismiss === Swal.DismissReason.timer) {
                      console.log('User Created successfully:', response);
                      // window.location.href = 'http://localhost:3001/api/customer/listpage';
                      window.location.href = 'https://crudinvoicepostgresql.onrender.com/api/customer/listpage';
                  }
              });
          },
          error: function(xhr, status, error) {
              console.error('Error submitting form data:', error); 
              Swal.fire({
                  icon: "error",
                  title: "Oops...",
                  text: "Something went wrong!",
              }); 
          }
      });
  });



  $(document).on("click", "#btnEdit", function () {
    var id = $(this).data("id");
    $.ajax({
        url: `/api/customer/editpage/${id}`,
        method: "GET",
        success: function (result) {
            if (result) {
                const data = result.data;
                $('input[name="customer_id"]').val(data.id);
                $('input[name="edit_customer_name"]').val(data.customer_name);
                $('input[name="edit_customer_phone"]').val(data.customer_phone);
                $('input[name="edit_customer_email"]').val(data.customer_email);
                $('textarea[name="edit_customer_address"]').val(data.customer_address);
            }
        },
        error: function (xhr, status, error) {
            console.log("Error Status:", status);
            console.log("Error Response:", xhr.responseText);
            console.log("Error Message:", error);
        }
    });
});




$('#editCustomerForm').submit(function(e) {
  e.preventDefault();
  var form = $(this)[0];
  var updatedFormData = new FormData(form);
  let customerId = $('#customer_id').val();
  if (!customerId) {
    console.error('Error: Customer ID not found.');
    return;
  }
  $.ajax({
    url: `/api/customer/editpage/${customerId}`,
    type: 'PUT',
    data: updatedFormData,
    contentType: false,
    processData: false,
    success: function(response) {
      Swal.fire({
        icon: "success",
        title: `${response.message}`,
        showConfirmButton: false,
        timer: 1500,
      }).then((result) => {
        if (result.dismiss === Swal.DismissReason.timer) {
          window.location.reload();
        }
      });
    },
    error: function(xhr, status, error) {
      console.error('Error updating form data:', error);
    }
  });
});



$(document).on("click", ".btnDelete", function () {
    var id = $(this).data("id");
    console.log(id);
    Swal.fire({
      title: "Are you sure?",
      text: "Want to Delete This !!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Delete!",
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          url: `/api/customer/deletepage/${id}`,
          type: "DELETE",
          success: function (response) {
            Swal.fire({
              icon: "success",
              title: "Deleted !!",
              showConfirmButton: false,
              timer: 1500,
            }).then((result) => {
              if (result.dismiss === Swal.DismissReason.timer) {
                window.location.reload();
              }
            });
          },
          error: function (error) {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Something went wrong!",
            });
          },
        });
      }
    }).catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
      });
    });
  });

});
