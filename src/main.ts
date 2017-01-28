var currentPage: number = 1;

function nextPage() {
    $('slide'+currentPage).fadeOut();
    currentPage++;
    $('slide'+currentPage).fadeIn();
}
