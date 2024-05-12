var before = document.getElementById("before");
var liner = document.getElementById("liner");
var command = document.getElementById("typer");
var textarea = document.getElementById("texter");
var terminal = document.getElementById("terminal");

var git = 0;
var pw = false;
var commands = [];

setTimeout(function () {
  loopLines(banner, "", 80);
  textarea.focus();
}, 100);

window.addEventListener("keyup", enterKey);

//init
textarea.value = "";
command.innerHTML = textarea.value;

function enterKey(e) {
  if (e.keyCode == 181) {
    document.location.reload(true);
  }

  if (e.keyCode == 13) {
    commands.push(command.innerHTML);
    git = commands.length;
    addLine(
      "guest@daxxtropezz.github.io:~$" + command.innerHTML,
      "no-animation",
      0
    );
    commander(command.innerHTML.toLowerCase());
    command.innerHTML = "";
    textarea.value = "";
  }
  if (e.keyCode == 38 && git != 0) {
    git -= 1;
    textarea.value = commands[git];
    command.innerHTML = textarea.value;
  }
  if (e.keyCode == 40 && git != commands.length) {
    git += 1;
    if (commands[git] === undefined) {
      textarea.value = "";
    } else {
      textarea.value = commands[git];
    }
    command.innerHTML = textarea.value;
  }
}

function commander(cmd) {
  switch (cmd.toLowerCase()) {
    case "help":
      loopLines(help, "color2 margin", 80);
      break;
    case "whoami":
      loopLines(whoami, "color2 margin", 80);
      break;
    case "DEV":
      addLine("opening Dev.to...", "color2", 80);
      newTab(Dev);
      break;
    case "social":
      loopLines(social, "color2 margin", 80);
      break;
    case "projects":
      loopLines(projects, "color2 margin", 80);
      break;
    case "history":
      addLine("<br>", "", 0);
      loopLines(commands, "color2", 80);
      addLine("<br>", "command", 80 * commands.length + 50);
      break;
    case "emailme":
      addLine(
        'opening mailto:<a href="mailto:miraflores.john@gmail.com"> miraflores.john@gmail.com</a>...',
        "color2",
        80
      );
      newTab(emailme);
      break;
    case "clear":
    case "cls":
      setTimeout(function () {
        terminal.innerHTML = '<a id="before"></a>';
        before = document.getElementById("before");
      }, 1);
      break;
    case "banner":
      loopLines(banner, "", 80);
      break;
    case "secret":
      addLine(
        `<br><pre class="whitespace-pre-wrap">\t<span class="command">sudo</span>\t\t&nbsp;\ta secret code for ADMIN ONLY
        </pre>`,
        "color2",
        0
      );
      break;
    // socials
    case "twitter":
      addLine("opening Twitter...", "color2", 0);
      newTab(twitter);
      break;
    case "linkedin":
      addLine("opening LinkedIn...", "color2", 0);
      newTab(linkedin);
      break;
    case "instagram":
      addLine("opening Instagram...", "color2", 0);
      newTab(instagram);
      break;
    case "github":
      addLine("opening GitHub...", "color2", 0);
      newTab(github);
      break;
    case "sudo":
      addLine("Oh no, you're not an admin...", "color2", 0);
      newTab(sudo);
      break;
    default:
      addLine(
        // '<span class="inherit">Command not found. For a list of commands, type <span class="command">\'help\'</span>.</span>',
        `<span>Command not found. For a list of commands, type <span class="command">'help'</span>.</span>
        <br><span> <b>Note</b>: Press <span class = "command">'↳ Tab'</span> key or click <b class="cursor" id="cursor">█</b> if you cannot type</span>`,
        "error",
        100
      );
      break;
  }
}

function newTab(link) {
  setTimeout(function () {
    window.open(link, "_blank");
  }, 500);
}

function addLine(text, style, time) {
  var t = "";
  for (let i = 0; i < text.length; i++) {
    if (text.charAt(i) == " " && text.charAt(i + 1) == " ") {
      t += "&nbsp;&nbsp;";
      i++;
    } else {
      t += text.charAt(i);
    }
  }
  setTimeout(function () {
    var next = document.createElement("p");
    next.innerHTML = t;
    next.className = style;

    before.parentNode.insertBefore(next, before);

    window.scrollTo(0, document.body.offsetHeight);
  }, time);
}

function loopLines(name, style, time) {
  name.forEach(function (item, index) {
    addLine(item, style, index * time);
  });
}

console.log(
  "%cYou're a Hacker!😠",
  "color: #04ff00; font-weight: bold; font-size: 24px;"
);

document.addEventListener("keydown", function (event) {
  if (event.key === "Tab") {
    event.preventDefault();
    document.getElementById("texter").focus();
  }
});
