var before = document.getElementById('before')
var liner = document.getElementById('liner')
var command = document.getElementById('typer')
var textarea = document.getElementById('texter')
var terminal = document.getElementById('terminal')

var git = 0
var pw = false
let pwd = false
var commands = []

setTimeout(function() {
    loopLines(banner, '', 80)
    textarea.focus()
}, 100)

window.addEventListener('keyup', enterKey)

//init
textarea.value = ''
command.innerHTML = textarea.value

function enterKey(e) {
    if (e.keyCode == 181) {
        document.location.reload(true)
    }
    if (pw) {
        let et = '*'
        let w = textarea.value.length
        command.innerHTML = et.repeat(w)
        if (textarea.value === password) {
            pwd = true
        }
        if (pwd && e.keyCode == 13) {
            loopLines(secret, 'color2 margin', 120)
            command.innerHTML = ''
            textarea.value = ''
            pwd = false
            pw = false
            liner.classList.remove('password')
        } else if (e.keyCode == 13) {
            addLine('Wrong password', 'error', 0)
            command.innerHTML = ''
            textarea.value = ''
            pw = false
            liner.classList.remove('password')
        }
    } else {
        if (e.keyCode == 13) {
            commands.push(command.innerHTML)
            git = commands.length
            addLine(
                'guest@daxxtropezz.github.io:~$⠀' + command.innerHTML,
                'no-animation',
                0,
            )
            commander(command.innerHTML.toLowerCase())
            command.innerHTML = ''
            textarea.value = ''
        }
        if (e.keyCode == 38 && git != 0) {
            git -= 1
            textarea.value = commands[git]
            command.innerHTML = textarea.value
        }
        if (e.keyCode == 40 && git != commands.length) {
            git += 1
            if (commands[git] === undefined) {
                textarea.value = ''
            } else {
                textarea.value = commands[git]
            }
            command.innerHTML = textarea.value
        }
    }
}

function commander(cmd) {
    cmd = cmd.trim()
    switch (cmd.toLowerCase()) {
        case '':
            break
        case 'daxxyishere':
            addLine(
                `<br>
      you think you can use it here? (╯°□°）╯︵ ┻━┻...
        <br>
        `,
                'color2',
                80,
            )
            break
        case 'help':
            loopLines(help, 'color2 margin', 80)
            break
        case 'return':
            addLine('returning to main profile...', 'color2', 80)
            setTimeout(function() {
                window.open('../../', '_self')
            }, 500)
            break
        case 'whoami':
            loopLines(whoami, 'color2 margin', 80)
            break
        case 'social':
            loopLines(social, 'color2 margin', 80)
            break
        case 'projects':
            loopLines(projects, 'color2 margin', 80)
            break
        case 'history':
            addLine('<br>', '', 0)
            loopLines(commands, 'color2', 80)
            addLine('<br>', 'command', 80 * commands.length + 50)
            break
        case 'emailme':
            addLine(
                `<br>
        opening mailto:<a href="mailto:miraflores.john@gmail.com"> miraflores.john@gmail.com</a>...
        <br>
        `,
                'color2',
                80,
            )
            newTab(emailme)
            break
        case 'clear':
        case 'cls':
            setTimeout(function() {
                terminal.innerHTML = '<a id="before"></a>'
                before = document.getElementById('before')
            }, 1)
            break
        case 'banner':
            loopLines(banner, '', 80)
            break
        case 'secret':
            liner.classList.add('password')
            pw = true
            break
        case 'password':
            addLine(
                `<br>
        do you even know what you're doing?
        <br>
        `,
                'color2',
                0,
            )
            break
        case 'sudo':
        case 'sudo su':
            addLine(
                `<br>
        oh no, you're not an admin...
        <br>
        `,
                'color2',
                0,
            )
            newTab(sudo)
            break
            // socials
        case 'facebook':
        case 'fb':
            addLine('opening Facebook...', 'color2', 0)
            newTab(facebook)
            break
        case 'twitter':
            addLine('opening Twitter...', 'color2', 0)
            newTab(twitter)
            break
        case 'linkedin':
            addLine('opening LinkedIn...', 'color2', 0)
            newTab(linkedin)
            break
        case 'instagram':
        case 'ig':
            addLine('opening Instagram...', 'color2', 0)
            newTab(instagram)
            break
        case 'github':
        case 'git':
            addLine('opening GitHub...', 'color2', 0)
            newTab(github)
            break
        default:
            if (cmd.includes('?')) {
                addLine(
                    `<br>
        Why ask a question here?<br>
        Do you think I made this to be like an AI like ChatGPT?<br>
        (╯°□°）╯︵ ┻━┻...
          <br>
          `,
                    'color2',
                    80,
                )
            } else {
                //prettier-ignore
                addLine(
                    `<br>
<span class="command">'${textarea.value.replace(/^\s+|\s+$/gm, '')}'</span> is not recognized as an internal or external command. For a list of commands, type <span class="command"> 'help'</span>.<br>
<b>Note</b>: Press <span class="command"> '↳ Tab'</span> key or click <b class="cursor" id="cursor">█</b> if you're unable to type.
  <br>
    `,
                    'error',
                    100,
                )
            }

            break
    }
})
}

function newTab(link) {
    setTimeout(function() {
        window.open(link, '_blank')
    }, 500)
}

function addLine(text, style, time) {
    var t = ''
    for (let i = 0; i < text.length; i++) {
        if (text.charAt(i) == ' ' && text.charAt(i + 1) == ' ') {
            t += '&nbsp;&nbsp;'
            i++
        } else {
            t += text.charAt(i)
        }
    }
    setTimeout(function() {
        var next = document.createElement('p')
        next.innerHTML = t
        next.className = style

        before.parentNode.insertBefore(next, before)

        window.scrollTo(0, document.body.offsetHeight)
    }, time)
}

function loopLines(name, style, time) {
    name.forEach(function(item, index) {
        addLine(item, style, index * time)
    })
}

console.log(
    '%cWhat a Hacker!😠\nNow you know my password!',
    'color: #04ff00; font-weight: bold; font-size: 24px;',
)
console.log(
    "%cPassword: '" +
    password +
    "' - do you even know how to use it?🤔\nI bet you don't 😈",
    'color: grey',
)

document.addEventListener('keydown', function(event) {
    if (event.key === 'Tab') {
        event.preventDefault()
        document.getElementById('texter').focus()
    }
})

async function pasteFromClipboard() {
    try {
        document.querySelector('#texter').value +=
            await navigator.clipboard.readText()
    } catch (error) {
        console.log('Failed to read clipboard')
    }
}
document.addEventListener('contextmenu', function(event) {
    event.preventDefault()

    Toastify({
        text: "You pasted from clipboard,\nPress 'Tab' key to continue",
        duration: 3000,
        destination: 'https://github.com/apvarun/toastify-js',
        newWindow: true,
        close: false,
        gravity: 'bottom',
        position: 'left',
        stopOnFocus: true,
        style: {
            background: 'linear-gradient(to right, #c07489, #8a9ce8)',
        },
        onClick: function() {}, // Callback after click
    }).showToast()
})

document.addEventListener('contextmenu', pasteFromClipboard)