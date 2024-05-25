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

// document.getElementById('seCertBtn1').addEventListener('click', () => {
//   showFullscreenModal(
//     './assets/images/certifications/2b14fb3228a3188d0896925bc5ac3220.png',
//     './assets/images/wmrker.png',
//     'Software Engineer',
//   )
// })

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
  {
    selector: '#certcommandbutton',
    content:
      "Want to see my certificates? Open terminal and type the command 'certificates' to see all.",
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
