$(document).ready(function() {
  $('#invoiceEditForm').hide();
    let timer;
    $('#searchInput').on('input', function() {
        clearTimeout(timer);
        timer = setTimeout(function() {
            $('#searchForm').submit();
        }, 500);
    });
});


$(document).on("click", "#btnView", function () {
    var id = $(this).data("id");
    $.ajax({
        url: `/api/invoice/edit/${id}`,
        method: "GET",
        success: function (result) {
            if (result) {
                const data = result.data;
                let modalContent = `
                    <div class="row">
                        <div class="col-sm-6 text-grey-m2">
                            <div class="my-1"><span class="text-600 text-90">Customer Name:</span> ${data.customer_name}</div>
                            <div class="my-1"><span class="text-600 text-90">Customer Phone:</span> ${data.customer_phone}</div>
                            <div class="my-1"><span class="text-600 text-90">Customer Email:</span> ${data.customer_email}</div>
                            <div class="my-1"><span class="text-600 text-90">Customer Address:</span> ${data.customer_address}</div>
                        </div>
                        <div class="text-95 col-sm-6 align-self-start d-sm-flex justify-content-end">
                            <hr class="d-sm-none" />
                            <div class="text-grey-m2">
                                <div class="my-2"><span class="text-600 text-90">Invoice ID:</span> ${data.invoice_id}</div>
                                <div class="my-2"><span class="text-600 text-90">Invoice No:</span> ${data.invoice_no}</div>
                                <div class="my-2"><span class="text-600 text-90">Invoice Date:</span> ${data.invoice_date}</div>
                            </div>
                        </div>
                    </div>
                    <div class="mt-4">
                        <div class="row text-600 text-primary bgc-default-tp1 py-25">
                            <div class="d-none d-sm-block col-1">#</div>
                            <div class="col-3">Stock Code</div>
                            <div class="d-none d-sm-block col-2">Stock Price</div>
                            <div class="col-2">Stock Quantity</div>
                            <div class="col-2">Amount</div>
                            <div class="d-none d-sm-block">Stock Description</div> 
                        </div>
                        <hr class="row brc-default-l1 mx-n1 mb-2" />
                `;
                let totalAmount = 0;
                data.stock_items.forEach((item, index) => {
                    const amount = item.stock_price * item.stock_quantity;
                    var split_amount = formatNumberWithCommas(amount);
                    totalAmount += amount;
                    modalContent += `
                        <div class="text-95 text-secondary-d3">
                            <div class="row mb-2 mb-sm-0 py-25">
                                <div class="d-none d-sm-block col-1">${++index}</div>
                                <div class="col-3">${item.stock_code}</div>
                                <div class="d-none d-sm-block col-2">${formatNumberWithCommas(item.stock_price)}</div>
                                <div class="col-2 text-secondary-d2">${item.stock_quantity}</div>
                                <div class="col-2 text-secondary-d2">${split_amount}</div>
                                <div class="d-none d-sm-block col-2">${item.stock_description}</div>
                            </div>
                        </div>
                        <div class="row border-b-2 brc-default-l2"></div>
                        <hr class="row brc-default-l1 mx-n1 mb-2" />
                    `;
                });
                modalContent += `
                    </div>
                    <div class="text-95 text-secondary-d3 mt-3">
                        <div class="row py-25">
                            <div class="col-4"></div>
                            <div class="col-4 text-120 text-right">Total Amount:</div>
                            <div class="col-4 text-120">${formatNumberWithCommas(totalAmount)}</div>
                        </div>
                    </div>
                `;
                $("#modal-body").html(modalContent);
                $("#invoiceViewModal").modal("show");
            }
        },
        error: function (xhr, status, error) {
            console.log("Error Status:", status); 
            console.log("Error Response:", xhr.responseText);
            console.log("Error Message:", error);
        }
    });
});

function formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

$(document).on("click", "#btnPrint", function () {
    $("#invoiceViewModal").modal("hide");
    printModalContent();
});


function printModalContent() {
    var printContents = document.getElementById("modal-body").innerHTML;
    var originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
}


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
          url: `/api/invoice/delete/${id}`,
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
  

  $(document).on("click", "#btnEdit", function () {
    $('#invoiceEditForm').show();
    $('#invoice-list-container').hide();
    var id = $(this).data("id");
    $.ajax({
        url: `/api/invoice/edit/${id}`,
        method: "GET",
        success: function (result) {
            if (result) {
                const data = result.data;
                $('input[name="invoice_id"]').val(data.invoice_id);
                $('input[name="customer_name"]').val(data.customer_name);
                $('input[name="customer_phone"]').val(data.customer_phone);
                $('input[name="customer_email"]').val(data.customer_email);
                $('input[name="customer_address"]').val(data.customer_address);

                $("tbody").empty();

                data.stock_items.forEach(function (stock) {
                    let newRow = `
                        <tr>
                            <td><input type="text" name="stock_code[]" value="${stock.stock_code}" placeholder="Enter Stock Code"></td>
                            <td><input type="text" name="stock_description[]" value="${stock.stock_description}" placeholder="Enter Stock Description"></td>
                            <td><input type="number" step="0.00" name="stock_price[]" value="${stock.stock_price}" placeholder="Enter Stock Price"></td>
                            <td><input type="number" name="stock_quantity[]" value="${stock.stock_quantity}" placeholder="Enter Stock Quantity"></td>
                            <td><input type="text" name="amount[]" value="${(stock.stock_price * stock.stock_quantity).toFixed(2)}" readonly></td>
                            <td><button class="btn btn-danger remove_button">Remove</button></td>
                        </tr>
                    `;
                    $('#totalAmount').text(data.total_amount);
                    $("tbody").append(newRow);
                });

                $("#stockList").show();
                $(".total").show();
                $("#btnSubmit").show();

                $(".add_button").click(function () {
                    let newRow = `
                        <tr>
                            <td><input type="text" name="stock_code[]" placeholder="Enter Stock Code"></td>
                            <td><input type="text" name="stock_description[]" placeholder="Enter Stock Description"></td>
                            <td><input type="number" step="0.00" name="stock_price[]" placeholder="Enter Stock Price"></td>
                            <td><input type="number" name="stock_quantity[]" placeholder="Enter Stock Quantity"></td>
                            <td><input type="text" name="amount[]" readonly></td>
                            <td><button class="btn btn-danger remove_button">Remove</button></td>
                        </tr>
                    `;
                    $("tbody").append(newRow);
                });

                $("tbody").on("click", ".remove_button", function () {
                    $(this).closest("tr").remove();
                    updateTotalAmount();
                });

                $("tbody").on("input", "input[name='stock_price[]'], input[name='stock_quantity[]']", function () {
                    let price = parseFloat($(this).closest("tr").find("input[name='stock_price[]']").val()) || 0;
                    let quantity = parseInt($(this).closest("tr").find("input[name='stock_quantity[]']").val()) || 0;
                    let amount = price * quantity;
                    $(this).closest("tr").find("input[name='amount[]']").val(amount.toFixed(2));
                    updateTotalAmount();
                });

                function updateTotalAmount() {
                    let totalAmount = 0;
                    $("input[name='amount[]']").each(function () {
                        totalAmount += parseFloat($(this).val()) || 0;
                    });
                    $("#totalAmount").text(totalAmount.toFixed(2));
                    $("input[name='total_amount']").val(totalAmount.toFixed(2));
                }
            }
        },
        error: function (xhr, status, error) {
            console.log("Error Status:", status);
            console.log("Error Response:", xhr.responseText);
            console.log("Error Message:", error);
        }
    });
});



$(document).on("click", "#btnUpdate", function () {
  let invoiceId = $('#invoice_id').val();
  if (!invoiceId) {
    console.error('Error: Invoice ID not found.');
    return;
  }
  let updatedFormData = getUpdatedFormData();
  console.log(updatedFormData,  "Form Updated Data")
  $.ajax({
    url: `/api/invoice/edit/${invoiceId}`,
    type: 'PUT',
    data: JSON.stringify(updatedFormData),
    contentType: 'application/json',
    success: function (response) {
      console.log('Form data updated successfully:', response);
      // window.location.href = 'http://localhost:3001/api/invoice/listpage';
      window.location.href = 'https://crudinvoicepostgresql.onrender.com/api/invoice/listpage';
    },
    error: function (xhr, status, error) {
      console.error('Error updating form data:', error);
    }
  });
});


function getUpdatedFormData() {
  let formData = {
    customer_name: $('input[name="customer_name"]').val(),
    customer_phone: $('input[name="customer_phone"]').val(),
    customer_email: $('input[name="customer_email"]').val(),
    customer_address: $('input[name="customer_address"]').val(),
    total_amount: $('input[name="total_amount"]').val(),
    stock_data: []
  };

  $("tbody tr").each(function () {
    let stockCode = $(this).find("input[name='stock_code[]']").val();
    let stockDescription = $(this).find("input[name='stock_description[]']").val();
    let stockPrice = $(this).find("input[name='stock_price[]']").val();
    let stockQuantity = $(this).find("input[name='stock_quantity[]']").val();

    if (stockCode && stockDescription && stockPrice && stockQuantity) {
      formData.stock_data.push({
        stock_code: stockCode,
        stock_description: stockDescription,
        stock_price: stockPrice,
        stock_quantity: stockQuantity,
      });
    }
  });

  return formData;
}


$(document).ready(function() {
  $('#csvUploadForm').submit(function(e) {
    e.preventDefault();

    var formData = new FormData(this);
    $.ajax({
      url: $(this).attr('action'),
      type: 'POST',
      data: formData,
      contentType: false,
      processData: false,
      success: function(response) {
        window.location.reload();
      },
      error: function(xhr, status, error) {
        console.error('Error uploading file:', error);
      }
    });
  });
});