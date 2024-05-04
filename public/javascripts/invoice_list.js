$(document).ready(function() {
    let timer;
    $('#searchInput').on('input', function() {
        clearTimeout(timer);
        timer = setTimeout(function() {
            $('#searchForm').submit();
        }, 500);
    });
});