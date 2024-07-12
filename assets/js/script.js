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
		selector: '#backtotop',
		content: 'Back to Top',
	},
	{
		selector: '#ref_hs',
		content: `Senior Manager Development
		&#13
		Contact: (+91) 9650808369`,
	},
	{
		selector: '#ref_dmc',
		content: 'Director, Core Software Development\nContact: (+63) 9177700877',
	},
	{
		selector: '#ref_at',
		content: 'I.T. Instructor\nContact: (+63) 999-881-3036',
	},
	{
		selector: '#ref_sff',
		content: 'UI/UX Designer\nContact: (+63) 993-330-2365',
	},
	{
		selector: '#skillsncerts',
		content: 'Skills & Certificates',
	},
	{
		selector: '#websitesfin',
		content: 'Websites & Arts',
	},
	{
		selector: '#contactme',
		content: 'Contact Me',
	},
	{
		selector: '#terminalbutton',
		content: 'Terminal Portfolio',
	},
	{
		selector: '#certcommandbutton',
		content:
			"Want to see my certificates? Open terminal and type the command 'certificates' to see all.",
	},
];
tooltips.forEach(({ selector, content }) => {
	tippy(selector, {
		content: content,
		followCursor: true,
	});
});
