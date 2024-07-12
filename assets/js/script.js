let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

window.onscroll = () => {
	sections.forEach((sec) => {
		let top = window.scrollY;
		let offset = sec.offsetTop - 150;
		let height = sec.offsetHeight;
		let id = sec.getAttribute('id');

		if (top >= offset && top < offset + height) {
			navLinks.forEach((links) => {
				links.classList.remove('active');
				document
					.querySelector('header nav a[href*=' + id + ' ]')
					.classList.add('active');
			});
		}
	});
};

menuIcon.onclick = () => {
	menuIcon.classList.toggle('bx-x');
	navbar.classList.toggle('active');
};

// tooltip
const tooltips = [
	{
		selector: '#ref_hs',
		content1: `Senior Manager Development`,
		content2: 'Contact: (+91) 965-080-8369',
	},
	{
		selector: '#ref_dmc',
		content1: 'Director, Core Software Development',
		content2: 'Contact: (+63) 917-770-0877',
	},
	{
		selector: '#ref_at',
		content1: 'I.T. Instructor',
		content2: 'Contact: (+63) 999-881-3036',
	},
	{
		selector: '#ref_sff',
		content1: 'UI/UX Designer',
		content2: 'Contact: (+63) 993-330-2365',
	},
];
tooltips.forEach(({ selector, content1, content2 }) => {
	tippy(selector, {
		content:
			'<center><strong>' +
			content1 +
			'<br><span style="color: gold;">' +
			content2 +
			'</span></strong></center>',
		followCursor: true,
		allowHTML: true,
	});
});
