window.onblur = function () {
	document.title = 'Milady! Please come back :(';
};

window.onfocus = function () {
	document.title = "Mira's Portfolio";
};

$(document).ready(function () {
	$(window).scroll(function () {
		// sticky navbar on scroll script
		if (this.scrollY > 20) {
			$('.navbar').addClass('sticky');
		} else {
			$('.navbar').removeClass('sticky');
		}

		// scroll-up button show/hide script
		if (this.scrollY > 500) {
			$('.scroll-up-btn').addClass('show');
		} else {
			$('.scroll-up-btn').removeClass('show');
		}
	});

	// slide-up script
	$('.scroll-up-btn').click(function () {
		$('html').animate({ scrollTop: 0 });
		// removing smooth scroll on slide-up button click
		$('html').css('scrollBehavior', 'auto');
	});

	$('.navbar .menu li a').click(function () {
		// applying again smooth scroll on menu items click
		$('html').css('scrollBehavior', 'smooth');
	});

	// toggle menu/navbar script
	$('.menu-btn').click(function () {
		$('.navbar .menu').toggleClass('active');
		$('.menu-btn i').toggleClass('active');
	});

	// typing text animation script
	var typed = new Typed('.typing', {
		strings: ['Designer', 'Developer', 'College Student', 'Freelancer'],
		typeSpeed: 100,
		backSpeed: 60,
		loop: true,
	});

	var typed = new Typed('.typing-0', {
		strings: ['John Paul Miraflores', 'Daxxtropezz'],
		typeSpeed: 100,
		backSpeed: 60,
		loop: true,
	});

	var typed = new Typed('.typing-1', {
		strings: ['Paul', 'JP', 'Daxxtropezz', 'John Paul'],
		typeSpeed: 100,
		backSpeed: 60,
		loop: true,
	});

	var typed = new Typed('.typing-2', {
		strings: ['Designer', 'Developer', 'College Student', 'Freelancer'],
		typeSpeed: 100,
		backSpeed: 60,
		loop: true,
	});
});

document.querySelectorAll('.button').forEach((button) => {
	let duration = 3000,
		svg = button.querySelector('svg'),
		svgPath = new Proxy(
			{
				y: null,
				smoothing: null,
			},
			{
				set(target, key, value) {
					target[key] = value;
					if (target.y !== null && target.smoothing !== null) {
						svg.innerHTML = getPath(target.y, target.smoothing, null);
					}
					return true;
				},
				get(target, key) {
					return target[key];
				},
			}
		);

	button.style.setProperty('--duration', duration);

	svgPath.y = 20;
	svgPath.smoothing = 0;

	button.addEventListener('click', (e) => {
		e.preventDefault();

		if (!button.classList.contains('loading')) {
			button.classList.add('loading');

			gsap.to(svgPath, {
				smoothing: 0.3,
				duration: (duration * 0.065) / 1000,
			});

			gsap.to(svgPath, {
				y: 12,
				duration: (duration * 0.265) / 1000,
				delay: (duration * 0.065) / 1000,
				ease: Elastic.easeOut.config(1.12, 0.4),
			});

			setTimeout(() => {
				svg.innerHTML = getPath(0, 0, [
					[3, 14],
					[8, 19],
					[21, 6],
				]);
			}, duration / 2);
		}
	});
});

function getPoint(point, i, a, smoothing) {
	let cp = (current, previous, next, reverse) => {
			let p = previous || current,
				n = next || current,
				o = {
					length: Math.sqrt(
						Math.pow(n[0] - p[0], 2) + Math.pow(n[1] - p[1], 2)
					),
					angle: Math.atan2(n[1] - p[1], n[0] - p[0]),
				},
				angle = o.angle + (reverse ? Math.PI : 0),
				length = o.length * smoothing;
			return [
				current[0] + Math.cos(angle) * length,
				current[1] + Math.sin(angle) * length,
			];
		},
		cps = cp(a[i - 1], a[i - 2], point, false),
		cpe = cp(point, a[i - 1], a[i + 1], true);
	return `C ${cps[0]},${cps[1]} ${cpe[0]},${cpe[1]} ${point[0]},${point[1]}`;
}

function getPath(update, smoothing, pointsNew) {
	let points = pointsNew
			? pointsNew
			: [
					[4, 12],
					[12, update],
					[20, 12],
			  ],
		d = points.reduce(
			(acc, point, i, a) =>
				i === 0
					? `M ${point[0]},${point[1]}`
					: `${acc} ${getPoint(point, i, a, smoothing)}`,
			''
		);
	return `<path d="${d}" />`;
}

// When the user clicks on div, open the popup
function popUpLinks() {
	var popup = document.getElementById('popLinks');
	popup.classList.toggle('show');
}

// copy text

function copyText(printedOut) {
	var popup2 = document.getElementById('copyLinkPop');
	popup2.classList.toggle('show2');
	var textInput = document.createElement('input');
	document.body.appendChild(textInput);
	textInput.value = printedOut.textContent;
	textInput.select();
	document.execCommand('copy', false);
	textInput.remove();
}

// no internet

const nipopup = document.querySelector('.nipopup'),
	wifiIcon = document.querySelector('.icon i'),
	nipopupTitle = document.querySelector('.nipopup .title'),
	nipopupDesc = document.querySelector('.desc'),
	reconnectBtn = document.querySelector('.reconnect');

let isOnline = true,
	intervalId,
	timer = 10;

const checkConnection = async () => {
	try {
		// Try to fetch random data from the API. If the status code is between
		// 200 and 300, the network connection is considered online
		const response = await fetch('https://jsonplaceholder.typicode.com/posts');
		isOnline = response.status >= 200 && response.status < 300;
	} catch (error) {
		isOnline = false; // If there is an error, the connection is considered offline
	}
	timer = 10;
	clearInterval(intervalId);
	handlePopup(isOnline);
};

const handlePopup = (status) => {
	if (status) {
		// If the status is true (online), update icon, title, and description accordingly
		wifiIcon.className = 'uil uil-wifi';
		nipopupTitle.innerText = 'Welcome Back';
		nipopupDesc.innerHTML =
			'Your device is now successfully connected to the internet.';
		nipopup.classList.add('online');
		return setTimeout(() => nipopup.classList.remove('show'), 2000);
	}
	// If the status is false (offline), update the icon, title, and description accordingly
	wifiIcon.className = 'uil uil-wifi-slash';
	nipopupTitle.innerText = 'No Internet Connection';
	nipopupDesc.innerHTML =
		'Your network is currently unavailable. Attempting to reconnect in <b>10</b> second/s.';
	nipopup.className = 'nipopup show';

	intervalId = setInterval(() => {
		// Set an interval to decrease the timer by 1 every second
		timer--;
		if (timer === 0) checkConnection(); // If the timer reaches 0, check the connection again
		nipopup.querySelector('.desc b').innerText = timer;
	}, 1000);
};

// Only if isOnline is true, check the connection status every 3 seconds
setInterval(() => isOnline && checkConnection(), 3000);
reconnectBtn.addEventListener('click', checkConnection);

// Counts website

function websiteVisits(response) {
	document.querySelector('#visits').textContent = response.value;
}
