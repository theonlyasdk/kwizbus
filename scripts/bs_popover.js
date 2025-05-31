const popover_elements = document.querySelectorAll('[data-bs-toggle="popover"]')
const popover_list = [...popover_elements].map(popover => new bootstrap.Popover(popover, {
    trigger: 'focus'
}));

popover_elements.forEach(popover => {
    popover.addEventListener("show.bs.popover", () => {
        setTimeout(() => {
            const bs_popover = bootstrap.Popover.getOrCreateInstance(popover);
            bs_popover.hide();
        }, 4000);
    });
});