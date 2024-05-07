$(document).ready(function() {
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
  