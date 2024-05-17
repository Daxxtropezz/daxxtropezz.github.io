document.addEventListener('contextmenu', function (event) {
  event.preventDefault()
})
document.addEventListener('keydown', function (event) {
  if (event.key === 'F12') {
    event.preventDefault()
  }
})

// ICON HOVER
// const imageElement = document.querySelector('.main-character')
// const buttonElement = document.querySelector('.terminal')
// const imageSources = [
//   './assets/images/a223ab17b8c472d2174799e210484171.gif',
//   './assets/images/8b858be36d6367ad826d6154507417f3.gif',
//   './assets/images/aa477a3ebd270f4d9a5731224b81d5b5.gif',
// ]

// buttonElement.addEventListener('mouseenter', () => {
//   const randomIndex = Math.floor(Math.random() * imageSources.length)
//   imageElement.src = imageSources[randomIndex]
// })

// -------
const audio = document.getElementById('background-music')
let isPlaying

function playAudio() {
  if (!isPlaying && !audio.paused) {
    audio.play().then(() => {
      isPlaying = true
    })
  }
}
document.addEventListener('click', playAudio)
// -------

// SOUND

function toggleMode() {
  const body = document.body
  const currentMode = body.classList.contains('mute-mode') ? 'mute' : 'unmute'
  const newMode = currentMode === 'mute' ? 'unmute' : 'mute'

  body.classList.remove(currentMode + '-mode')
  body.classList.add(newMode + '-mode')

  localStorage.setItem('soundOptions', newMode)
  updateModeBtn(newMode)
}

function updateModeBtn(mode) {
  const modeIcon = document.getElementById('mode-icon')
  const button = document.querySelector('.sound-float-btn')
  if (mode === 'mute') {
    audio.pause()
    isPlaying = false
    modeIcon.classList.remove('fa-volume-high')
    modeIcon.classList.add('fa-volume-xmark')
    button.style.backgroundColor = '#f0f0f0'
    button.style.color = '#265cc1'
  } else {
    document.addEventListener(
      'click',
      function () {
        audio
          .play()
          .then(() => {
            isPlaying = true
          })
          .catch((error) => {
            console.error('Failed to play audio:', error)
          })
      },
      { once: true },
    )
    modeIcon.classList.remove('fa-volume-xmark')
    modeIcon.classList.add('fa-volume-high')
    button.style.backgroundColor = '#265cc1'
    button.style.color = '#f0f0f0'
  }
}

let storedMode = localStorage.getItem('soundOptions')

if (!storedMode) {
  storedMode = 'unmute'
  localStorage.setItem('soundOptions', storedMode)
}
updateModeBtn(storedMode)
document.body.classList.add(storedMode + '-mode')

window.addEventListener('load', function () {
  if (storedMode === 'mute') {
    audio.pause()
  }
})

// SOUND END

document.getElementById('fcvsuCertBtn1').addEventListener('click', () => {
  showFullscreenModal(
    './assets/images/certifications/f3f6cfea27d820e8eff34b91ad38b0b9.png',
    './assets/images/wmrker.png',
    'Microservices Development w/ Springboot',
  )
})
document.getElementById('fcvsuCertBtn2').addEventListener('click', () => {
  showFullscreenModal(
    './assets/images/certifications/f4a7f1bd0e229c76aa1ce573969a00a4.png',
    './assets/images/wmrker.png',
    'Springboot Fundamental',
  )
})
document.getElementById('fcvsuCertBtn3').addEventListener('click', () => {
  showFullscreenModal(
    './assets/images/certifications/f7eb05a624d11843d8f0edb97bea2169.png',
    './assets/images/wmrker.png',
    'API Fundamental',
  )
})
document.getElementById('fcvsuCertBtn4').addEventListener('click', () => {
  showFullscreenModal(
    './assets/images/certifications/fb0ba786c371f70e9b6092e11971fb88.jpg',
    './assets/images/wmrker.png',
    'Data that Delivers - Insights to Results',
  )
})
document.getElementById('fcvsuCertBtn5').addEventListener('click', () => {
  showFullscreenModal(
    './assets/images/certifications/fc71a76015c29a1aa3e83f6167ceb855.png',
    './assets/images/wmrker.png',
    'What Does GPT Really Mean for Digital Marketing?',
  )
})

document.getElementById('seCertBtn1').addEventListener('click', () => {
  showFullscreenModal(
    './assets/images/certifications/2b14fb3228a3188d0896925bc5ac3220.png',
    './assets/images/wmrker.png',
    'Software Engineer',
  )
})
document.getElementById('orcCertBtn1').addEventListener('click', () => {
  showFullscreenModal(
    './assets/images/certifications/1c77eec6f493bdef4aeafbf948afc0a8.jpg',
    './assets/images/wmrker.png',
    'Oracle Certificate',
  )
})
document.getElementById('orcCertBtn2').addEventListener('click', () => {
  showFullscreenModal(
    './assets/images/certifications/1c9487aee34cf4a8f18d2ac36c2b79bf.jpg',
    './assets/images/wmrker.png',
    'Oracle Certificate',
  )
})
document.getElementById('orcCertBtn3').addEventListener('click', () => {
  showFullscreenModal(
    './assets/images/certifications/950c4790da8075c470fa8f241c11888f.jpg',
    './assets/images/wmrker.png',
    'Oracle Certificate',
  )
})

document.getElementById('daBtn1').addEventListener('click', () => {
  showFullscreenModal(
    './assets/images/certifications/db8a0582cbfabfbd1b1caa71f90aba88.jpg',
    './assets/images/wmrker.png',
    'Data Analytics Essentials',
  )
})
document.getElementById('daBtn2').addEventListener('click', () => {
  showFullscreenModal(
    './assets/images/certifications/83cffe57f3598a164ebfd9f437f6a259.jpg',
    './assets/images/wmrker.png',
    'Introduction to Data Science',
  )
})

document.getElementById('hrCertBtn1').addEventListener('click', () => {
  showFullscreenModal(
    './assets/images/certifications/b690160a432af4cf4c19e877199749d6.png',
    './assets/images/wmrker.png',
    'SQL (Basic)',
  )
})
document.getElementById('hrCertBtn2').addEventListener('click', () => {
  showFullscreenModal(
    './assets/images/certifications/a3a47433d9da4b10243246c925b2b6bf.png',
    './assets/images/wmrker.png',
    'Frontend Developer (React)',
  )
})
document.getElementById('hrCertBtn3').addEventListener('click', () => {
  showFullscreenModal(
    './assets/images/certifications/2522d3987a1f3492ed977900658bfb69.png',
    './assets/images/wmrker.png',
    'Python (Basic)',
  )
})
document.getElementById('hrCertBtn4').addEventListener('click', () => {
  showFullscreenModal(
    './assets/images/certifications/5c047afbb4b0aac395be9124894eae73.png',
    './assets/images/wmrker.png',
    'Problem Solving (Basic)',
  )
})

document.getElementById('artImgBtn5').addEventListener('click', () => {
  showFullscreenModal(
    './assets/images/arts/e8d80a5115a22eeb0788d72ae7d0b30c.png',
    null,
    'Draftings',
  )
})
document.getElementById('artImgBtn4').addEventListener('click', () => {
  showFullscreenModal(
    './assets/images/arts/85eba8bcf9604dd52dccd264d56e2ef4.png',
    null,
    'Draftings',
  )
})
document.getElementById('artImgBtn3').addEventListener('click', () => {
  showFullscreenModal(
    './assets/images/arts/8d4f9e3fdd5754cd3fc81ba492b86dda.png',
    null,
    'Draftings',
  )
})
document.getElementById('artImgBtn2').addEventListener('click', () => {
  showFullscreenModal(
    './assets/images/arts/097dc82661b70ab38132811fe3759155.png',
    null,
    'Draftings',
  )
})
document.getElementById('artImgBtn1').addEventListener('click', () => {
  showFullscreenModal(
    './assets/images/arts/b6d63bcde6761ae7777cbab09283fac2.png',
    null,
    'Draftings',
  )
})
document.getElementById('certImgBtn1').addEventListener('click', () => {
  showFullscreenModal(
    './assets/images/certifications/d15f8c03838118ed6beb288e10b228d0.png',
    './assets/images/wmrker.png',
    'CS403: Introduction to Modern Database Systems',
  )
})
document.getElementById('certImgBtn2').addEventListener('click', () => {
  showFullscreenModal(
    './assets/images/certifications/eceb485437e6c423dbb50faffb4b75e2.png',
    './assets/images/wmrker.png',
    'APIs & Web Services',
  )
})
document.getElementById('certImgBtn3').addEventListener('click', () => {
  showFullscreenModal(
    './assets/images/certifications/7d17d9cccfc20aeb282b3113cc10f795.png',
    './assets/images/wmrker.png',
    'Current Trends & Issues in Computer & Information Technology',
  )
})
document.getElementById('certImgBtn4').addEventListener('click', () => {
  showFullscreenModal(
    './assets/images/certifications/55d448864ab7ea2a37bfd90e7b6012f6.png',
    './assets/images/wmrker.png',
    'Computer Hardware Assembly & Disassembly',
  )
})
document.getElementById('certImgBtn5').addEventListener('click', () => {
  showFullscreenModal(
    './assets/images/certifications/04ba2e5acb4970912f4c980a0c9095d8.jpg',
    './assets/images/wmrker.png',
    'Mission 1: A Disclosure on IT Profession',
  )
})
document.getElementById('certImgBtn6').addEventListener('click', () => {
  showFullscreenModal(
    './assets/images/certifications/214837a83d0d9b08a2ee9dd8753525b2.png',
    './assets/images/wmrker.png',
    'PNPKI and Data Privacy Orientation',
  )
})
document.getElementById('certImgBtn7').addEventListener('click', () => {
  showFullscreenModal(
    './assets/images/certifications/82c88dc884434b0a41fd3d5f60938a4b.jpg',
    './assets/images/wmrker.png',
    'Cybersecurity Awareness',
  )
})
document.getElementById('mobImgBtn1').addEventListener('click', () => {
  showFullscreenModal(
    './assets/images/apps/918f3caf4bb1080ab388ec775980940f.png',
    null,
    'Mobile Applications',
  )
})
document.getElementById('mockImgBtn1').addEventListener('click', () => {
  showFullscreenModal(
    './assets/images/mock/7e81ada7856bfc9947d43e1c6c62128f.png',
    null,
    'Mockups',
  )
})
document.getElementById('waImgBtn1').addEventListener('click', () => {
  showFullscreenModal(
    './assets/images/apps/58c52c965c4d7f6a0301c5dc08c423a7.png',
    null,
    'Web Applications',
  )
})

function showFullscreenModal(imageUrl, watermarkUrl, imageAlt) {
  swal.fire({
    imageUrl: imageUrl,
    imageAlt: imageAlt,
    showCloseButton: true,
    showConfirmButton: false,
    customClass: {
      popup: 'fullscreen',
    },
    didOpen: function () {
      if (watermarkUrl) {
        const mainImage = document.querySelector('.swal2-image')
        const watermarkImage = document.createElement('img')
        watermarkImage.src = watermarkUrl
        watermarkImage.className = 'watermark'
        watermarkImage.style.width = mainImage.width + 'px'
        watermarkImage.style.height = mainImage.height + 'px'
        document.querySelector('.swal2-popup').appendChild(watermarkImage)
      }
    },
  })
}
$(function () {
  $('#loadingHtml').load('./extras/loading.html')
})
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
})
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
        localStorage.clear()
        window.opener = null
        window.open('', '_self')
        window.close()
        window.history.go(-1)
        $(document.body).hide()
      }
    })
  })
document
  .getElementById('terminalbutton')
  .addEventListener('click', function () {
    // -- TERMINAL NAV
    Swal.fire({
      title: 'Warning!',
      text: 'Do you really wish to proceed to my new terminal portfolio?',
      imageUrl: './assets/images/33180e7e10c9fcab642b5c5075465f6c.png',
      color: '#FFF',
      background: '#1f317dc0',
      imageWidth: 150,
      imageAlt: 'Gang Logo',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = '../cmd/'
      } else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
    // -- TERMINAL NAV
  })
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
  {
    selector: '#terminalbutton',
    content: 'Terminal Portfolio',
  },
]
tooltips.forEach(({ selector, content }) => {
  tippy(selector, {
    content: content,
    followCursor: true,
  })
})
// ---------

// WEBSITE HEAD TITLE
window.onblur = function () {
  document.title = 'Checkout my portfolio!'
}

window.onfocus = function () {
  document.title = 'Daxxtropezz | HOME'
}

var elements = document.querySelectorAll('.typing-name')

elements.forEach(function (element) {
  var typed = new Typed(element, {
    strings: ['John Paul Miraflores', 'Daxxtropezz', 'Daxxy', 'Paul', 'JP'],
    typeSpeed: 100,
    backSpeed: 60,
    loop: true,
  })
})

const iconBoxes = document.querySelectorAll('.icon-box')
const iconBoxContainers = document.querySelectorAll('.icon-container')
const closeBtns = document.querySelectorAll('.close-btn')
const maximizeBtns = document.querySelectorAll('.maximize-btn')
const body = document.querySelector('body')

iconBoxes.forEach((btn) => {
  btn.addEventListener('click', () => {
    let modalId = btn.getAttribute('data-modal')
    try {
      let modal = document.getElementById(modalId)
      if (modal) {
        modal.style.display = 'block'
        body.classList.add('prevent-background-scroll')
      } else {
        throw new Error(`Element with ID ${modalId} not found`)
      }
    } catch (error) {}
  })
})

closeBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    let modal = btn.closest('.popup')
    modal.style.display = 'none'
    body.classList.remove('prevent-background-scroll')
    iconBoxContainers.forEach((container) => {
      container.style.display = 'flex'
    })
  })
})

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('popup')) {
    e.target.style.display = 'none'
    body.classList.remove('prevent-background-scroll')
  }
})

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('popup')) {
    e.target.style.display = 'none'
    body.classList.remove('prevent-background-scroll')
  }
})

maximizeBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    let modal = btn.closest('.popup')
    let container = modal.querySelector('.popup-container')
    let body = modal.querySelector('.popup-body')

    if (modal.classList.contains('maximized')) {
      container.style.width = 'min(900px, 90%)'
      container.style.top = '45%'
      body.style.height = '70vh'
    } else {
      container.style.width = '100%'
      container.style.top = '50%'
      body.style.height = '90vh'
    }

    modal.classList.toggle('maximized')
    body.classList.toggle('prevent-scroll')
  })
})

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
})
