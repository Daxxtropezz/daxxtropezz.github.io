// -------
document.getElementById('artImgBtn2').addEventListener('click', () => {
	showFullscreenModal(
		'./assets/images/arts/097dc82661b70ab38132811fe3759155.png',
		'Draftings'
	);
});
document.getElementById('artImgBtn1').addEventListener('click', () => {
	showFullscreenModal(
		'./assets/images/arts/b6d63bcde6761ae7777cbab09283fac2.png',
		'Draftings'
	);
});
document.getElementById('certImgBtn1').addEventListener('click', () => {
	showFullscreenModal(
		'./assets/images/certifications/d15f8c03838118ed6beb288e10b228d0.png',
		'CS403: Introduction to Modern Database Systems'
	);
});
document.getElementById('certImgBtn2').addEventListener('click', () => {
	showFullscreenModal(
		'./assets/images/certifications/eceb485437e6c423dbb50faffb4b75e2.png',
		'APIs & Web Services'
	);
});
document.getElementById('certImgBtn3').addEventListener('click', () => {
	showFullscreenModal(
		'./assets/images/certifications/7d17d9cccfc20aeb282b3113cc10f795.png',
		'Current Trends & Issues in Computer & Information Technology'
	);
});
document.getElementById('certImgBtn4').addEventListener('click', () => {
	showFullscreenModal(
		'./assets/images/certifications/55d448864ab7ea2a37bfd90e7b6012f6.png',
		'Computer Hardware Assembly & Disassembly'
	);
});
document.getElementById('certImgBtn5').addEventListener('click', () => {
	showFullscreenModal(
		'./assets/images/certifications/04ba2e5acb4970912f4c980a0c9095d8.jpg',
		'Mission 1: A Disclosure on IT Profession'
	);
});
document.getElementById('certImgBtn6').addEventListener('click', () => {
	showFullscreenModal(
		'./assets/images/certifications/214837a83d0d9b08a2ee9dd8753525b2.png',
		'PNPKI and Data Privacy Orientation'
	);
});
document.getElementById('certImgBtn7').addEventListener('click', () => {
	showFullscreenModal(
		'./assets/images/certifications/82c88dc884434b0a41fd3d5f60938a4b.jpg',
		'Cybersecurity Awareness'
	);
});
document.getElementById('mobImgBtn1').addEventListener('click', () => {
	showFullscreenModal(
		'./assets/images/apps/918f3caf4bb1080ab388ec775980940f.png',
		'Mobile Applications'
	);
});
document.getElementById('mockImgBtn1').addEventListener('click', () => {
	showFullscreenModal(
		'./assets/images/mock/7e81ada7856bfc9947d43e1c6c62128f.png',
		'Mockups'
	);
});
document.getElementById('waImgBtn1').addEventListener('click', () => {
	showFullscreenModal(
		'./assets/images/apps/58c52c965c4d7f6a0301c5dc08c423a7.png',
		'Web Applications'
	);
});

function showFullscreenModal(imageUrl, imageAlt) {
	swal.fire({
		imageUrl: imageUrl,
		imageAlt: imageAlt,
		showCloseButton: true,
		showConfirmButton: false,
		customClass: {
			popup: 'fullscreen',
		},
	});
}
$(function () {
	$('#loadingHtml').load('./extras/loading.html');
});
var quill = new Quill('#editor-container', {
	modules: {
		toolbar: [
			[
				{
					header: [1, 2, false],
				},
			],
			['bold', 'italic', 'underline'],
			['image', 'code-block'],
		],
	},
	placeholder: 'Write something...',
	theme: 'snow',
});
document
	.getElementById('shutdownbutton')
	.addEventListener('click', function () {
		Swal.fire({
			title: 'Warning!',
			text: 'Are you sure you want to exit?',
			imageUrl: './assets/images/33180e7e10c9fcab642b5c5075465f6c.png',
			color: '#FFF',
			background: '#1f317dc0',
			imageWidth: 150,
			imageAlt: 'Gang Logo',
			confirmButtonColor: '#0a0a0a',
			cancelButtonColor: '#f1f1f1f',
			showCancelButton: true,
			confirmButtonText: 'Shutdown',
			cancelButtonText: 'Cancel',
			reverseButtons: true,
		}).then((result) => {
			if (result.isConfirmed) {
				window.opener = null;
				window.open('', '_self');
				window.close();
				window.history.go(-1);
				$(document.body).hide();
			}
		});
	});
const tooltips = [
	{
		selector: '#shutdownbutton',
		content: 'Close Application',
	},
	{
		selector: '#aboutbutton',
		content: 'About Me',
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
];
tooltips.forEach(({ selector, content }) => {
	tippy(selector, {
		content: content,
		followCursor: true,
	});
});
// ---------

// PREVENT OPENING THE TERMINAL
document.addEventListener('contextmenu', function (event) {
	event.preventDefault();
});
document.addEventListener('keydown', function (event) {
	if (event.key === 'F12') {
		event.preventDefault();
	}
});

// WEBSITE HEAD TITLE
window.onblur = function () {
	document.title = 'Checkout my portfolio!';
};

window.onfocus = function () {
	document.title = 'Daxxtropezz | HOME';
};

const audio = document.getElementById('background-music');
const playIcon = document.getElementById('play-music');
const pauseIcon = document.getElementById('pause-music');

let isPlaying = false;

function playAudio() {
	if (!isPlaying) {
		audio
			.play()
			.then(() => {
				isPlaying = true;
			})
			.catch((error) => {
				console.error('Error playing audio:', error);
			});
	}
}

document.addEventListener('click', playAudio);

audio.addEventListener('ended', function () {
	audio.currentTime = 0;
	audio.play();
});

var elements = document.querySelectorAll('.typing-name');

elements.forEach(function (element) {
	var typed = new Typed(element, {
		strings: ['John Paul Miraflores', 'Daxxtropezz', 'Daxxy', 'Paul', 'JP'],
		typeSpeed: 100,
		backSpeed: 60,
		loop: true,
	});
});

const iconBoxes = document.querySelectorAll('.icon-box');
const iconBoxContainers = document.querySelectorAll('.icon-container');
const closeBtns = document.querySelectorAll('.close-btn');
const maximizeBtns = document.querySelectorAll('.maximize-btn');
const body = document.querySelector('body');

iconBoxes.forEach((btn) => {
	btn.addEventListener('click', () => {
		let modalId = btn.getAttribute('data-modal');
		try {
			let modal = document.getElementById(modalId);
			if (modal) {
				modal.style.display = 'block';
				body.classList.add('prevent-background-scroll');
			} else {
				throw new Error(`Element with ID ${modalId} not found`);
			}
		} catch (error) {}
	});
});

closeBtns.forEach((btn) => {
	btn.addEventListener('click', () => {
		let modal = btn.closest('.popup');
		modal.style.display = 'none';
		body.classList.remove('prevent-background-scroll');
		iconBoxContainers.forEach((container) => {
			container.style.display = 'flex';
		});
	});
});

document.addEventListener('click', (e) => {
	if (e.target.classList.contains('popup')) {
		e.target.style.display = 'none';
		body.classList.remove('prevent-background-scroll');
	}
});

document.addEventListener('click', (e) => {
	if (e.target.classList.contains('popup')) {
		e.target.style.display = 'none';
		body.classList.remove('prevent-background-scroll');
	}
});

maximizeBtns.forEach((btn) => {
	btn.addEventListener('click', () => {
		let modal = btn.closest('.popup');
		let container = modal.querySelector('.popup-container');
		let body = modal.querySelector('.popup-body');

		if (modal.classList.contains('maximized')) {
			container.style.width = 'min(900px, 90%)';
			container.style.top = '45%';
			body.style.height = '70vh';
		} else {
			container.style.width = '100%';
			container.style.top = '50%';
			body.style.height = '90vh';
		}

		modal.classList.toggle('maximized');
		body.classList.toggle('prevent-scroll');
	});
});

var swiper = new Swiper('.swiper', {
	preventClicks: true,
	noSwiping: true,
	freeMode: false,
	spaceBetween: 10,
	navigation: {
		nextEl: '.next',
		prevEl: '.prev',
	},
	mousewheel: {
		invert: false,
		thresholdDelta: 50,
		sensitivity: 1,
	},
	breakpoints: {
		0: {
			slidesPerView: 1,
		},
		680: {
			slidesPerView: 2,
		},
		1100: {
			slidesPerView: 3,
		},
		1600: {
			slidesPerView: 4,
		},
	},
});
