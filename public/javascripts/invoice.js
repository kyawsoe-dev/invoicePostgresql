$(document).ready(function() {
  let totalAmount = 0;
  $("#stockList").hide();
  $(".total").hide();
  $("#btnSubmit").hide();

  $(".add_button").click(function() {
    $(".total").show();
    $("#btnSubmit").show();
    let newRow = `
      <tr>
        <td><input type="text" name="stock_code[]" placeholder="Enter Stock Code"></td>
        <td><input type="text" name="stock_description[]" placeholder="Enter Stock Description"></td>
        <td><input type="number" step="0.00" name="stock_price[]" placeholder="Enter Stock Price"></td>
        <td><input type="number" name="stock_quantity[]" placeholder="Enter Stock Quantity"></td>
        <td><input type="text" name="amount[]" readonly></td>
        <td><button class="btn btn-secondary remove_button">Remove</button></td>
      </tr>
    `;
    $("tbody").append(newRow);
    $("#stockList").show();
  });

  $("tbody").on("click", ".remove_button", function() {
    $(this).closest("tr").remove();
    updateTotalAmount();
  });

  $("tbody").on("input", "input[name='stock_price[]'], input[name='stock_quantity[]']", function() {
    let price = parseFloat($(this).closest("tr").find("input[name='stock_price[]']").val()) || 0;
    let quantity = parseInt($(this).closest("tr").find("input[name='stock_quantity[]']").val()) || 0;
    let amount = price * quantity;
    $(this).closest("tr").find("input[name='amount[]']").val(amount.toFixed(2));
    updateTotalAmount();
  });

  function updateTotalAmount() {
    totalAmount = 0;
    $("input[name='amount[]']").each(function() {
      totalAmount += parseFloat($(this).val()) || 0;
    });
    $("#totalAmount").text(totalAmount.toFixed(2));
    $("input[name='total_amount']").val(totalAmount.toFixed(2));
  }

  $('#invoiceForm').submit(function(e) {
    e.preventDefault();
    let formData = getFormData();
    $.ajax({
      url: '/api/invoice/create',
      type: 'POST',
      data: JSON.stringify(formData),
      contentType: 'application/json',
      success: function(response) {
        console.log('Form data submitted successfully:', response);
        // window.location.href = 'http://localhost:3001/api/invoice/listpage';
        window.location.href = 'https://crudinvoicepostgresql.onrender.com/api/invoice/listpage';
      },
      error: function(xhr, status, error) {
        console.error('Error submitting form data:', error);  
      }
    });
  });

  function getFormData() {
    let formData = {
      customer_name: $('input[name="customer_name"]').val(),
      customer_phone: $('input[name="customer_phone"]').val(),
      customer_email: $('input[name="customer_email"]').val(),
      customer_address: $('input[name="customer_address"]').val(),
      total_amount: $('input[name="total_amount"]').val(),
      stock_data: []
    };
  
    $("tbody tr").each(function() {
      let stock_code = $(this).find("input[name='stock_code[]']").val();
      let stock_description = $(this).find("input[name='stock_description[]']").val();
      let stock_price = $(this).find("input[name='stock_price[]']").val();
      let stock_quantity = $(this).find("input[name='stock_quantity[]']").val();
  
      if (stock_code && stock_description && stock_price && stock_quantity) {
        formData.stock_data.push({
          stock_code: stock_code,
          stock_description: stock_description,
          stock_price: stock_price,
          stock_quantity: stock_quantity,
        });
      }
    });
  
    return formData;
  }
  
});
