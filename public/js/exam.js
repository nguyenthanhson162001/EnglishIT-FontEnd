const urlParams = new URLSearchParams(window.location.search);
const unit = urlParams.get('unit');
const process = urlParams.get('process');
const socket = io("http://localhost:3004");
const examForm = $('.container-exam .exam');
const resultForm = $('.container-exam .result')
var btnAnswerClick
var autoplayAudio = true
const delayQuestion = 500
var audioCorrect = new Audio('./public/mp3/correct.mp3');
var audioUncorrect = new Audio('./public/mp3/uncorrect.mp3');
var countTotalQuestion = 0
audioCorrect.volume = 0.2
audioUncorrect.volume = 0.1
let s = 0
let m = 0;
var srcAudio = `https://api.voicerss.org/?key=19d2c8b86ed1444198305384a7129452&hl=en-us&c=MP3&f=16khz_16bit_stereo&src=`
    // var audio = new Audio('https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3');
    // audio.play();
window.onload = async() => {
    await configureClient();
    // awaitingLogin()
    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {
        // Process the login state
        await auth0.handleRedirectCallback();
        updateUIAndSetStorage();
        // Use replaceState to redirect the user away and remove the querystring parameters
        window.history.replaceState({}, document.title, "/");
    }
    updateUIAndSetStorage();
    awaitingLogin()

};
async function awaitingLogin() {

    if (auth0 && await auth0.isAuthenticated()) {
        let authentication = await auth0.getTokenSilently();
        if (!authentication || !unit || !process) {
            showError('')
            return
        }
        socket.emit('start-client', {
            authorization: authentication,
            unitSlug: unit,
            processSlug: process
        });
    } else {
        $('#btn-login').click();
    }
}
socket.on('start-server', ({ unitName, processName, sumTotalQuestion }) => {
    $('.unit-name').text(unitName);
    $('.sumNumberQuestion').text(sumTotalQuestion);
    countTotalQuestion = sumTotalQuestion
    examForm.show()
    $('.awaitingLogin').hide()
        // o is time sleep
    getQuestion(0)
    startTime()
    console.log(processName)
    if (processName.trim() == 'Vietnamese - English') {
        console.log('hide')
        $('.autoplay').hide()
        autoplayAudio = false;
        $('.question small').hide()
        $('.volumn_again').hide()
    }
})
socket.on('server-send-question', (data) => {
    //english ,spelling ,type ,option
    const { index, english, spelling, type, option } = data
    $('audio').attr('src', srcAudio + english)
    if (autoplayAudio) {
        document.querySelector('audio').play()
    }
    $('.question span').html(english)
    $('.question small').html(`/ ${spelling} /`)
    $('.question .type').html(`${type}`)
    $('.indexQuestion').html(index + 1)
    $('.Choice').html(`
        <div class="row">
            <button class="choice-btn ">${option[0]}</button>
            <button class="choice-btn ">${option[1]} </button>
        </div>
        <div class="row">
           <button class="choice-btn ">${option[2]}</button>
           <button class="choice-btn ">${option[3]}</button>
        </div>
    `)

    // axios('https://api.voicerss.org/?key=19d2c8b86ed1444198305384a7129452&hl=en-us&c=MP3&f=16khz_16bit_stereo&src=Hello, world!')
    //     .then(result => {
    //         alert('ahhi')
    //         console.log(result.data)
    //         var a = new Audio(result.data)
    //         a.play()
    //     })
    //     .catch((error) => {
    //         console.error('Error:', error);
    //     });

});
// choice answer
$('.Choice').on('click', '.choice-btn', function(e) {
    btnAnswerClick = this
    console.log(btnAnswerClick)
    chekAnswer(this.innerText)

})
socket.on('server-result-check-answer', (data) => {
    if (data.result) {
        // correct 
        audioCorrect.play()
        btnAnswerClick.classList.add("correct")

        getQuestion(delayQuestion)
    } else {
        audioUncorrect.play()
        btnAnswerClick.classList.add('uncorrect')

        // incorrect 
    }
})
socket.on('server-finish', (data) => {
    console.log(data)
    var numberUncorrect = data.length
    var percent = parseInt((countTotalQuestion - numberUncorrect) * (100.0 / countTotalQuestion))
    var time = $('.time-start span').text()

    resultForm.show()
    examForm.hide()
    $('.result .time span').text(time)
    $('.result .percent').text(`${percent}%`)
    clearInterval(timer);
    if (numberUncorrect == 0) {
        $('.list-incorrect').hide()
        return
    }
    var listUncorrect = data.map(function(e) {
        return `
        <li class="item">
             <div class="volumn_again" onclick="read('${e.english}')">
                 <i class="fal fa-volume-up "></i>
             </div>
             <div class="question">
                 <div class="vocabulary">
                     <span>${e.english}</span>
                 </div>
                 <div class="bottom">
                    ${e.vietnamese}
                 </div>
             </div>
         </li>
        `
    })
    $('.list-incorrect .items').html(listUncorrect.join(''))
});
socket.on('error', (data) => {
    showError(data.message)
});

$('.autoplay').on('click', () => {
    if (!$(".autoplay").hasClass("active")) {
        $(".autoplay").addClass('active');
        $(".autoplay i").removeClass('fa-toggle-off');
        $(".autoplay i").addClass('fa-toggle-on');
        autoplayAudio = true;
    } else {
        $('.autoplay').removeClass("active");
        $('.autoplay i').removeClass("fa-toggle-on");
        $(".autoplay i").addClass('fa-toggle-off');
        $('audio').removeAttr("autoplay");
        autoplayAudio = false;
    }
})
async function getQuestion(time) {

    window.setTimeout(() => {
        socket.emit('get-question')
    }, time);

}

function chekAnswer(answer) {
    socket.emit('check-answer', answer)
}


function showError(detail) {
    $('.unit-name').html('😢😢😢')
    $('.around').html(` <br> <h3>Error</h3>
    <small style='color:red'> ${detail}</small>
      <br>
    <a href="/index.html" style='color:blue'>Click me back to  my home </a>
      `)
}
var timer

function startTime() {
    timer = setInterval(function countTime() {
        if (++s == 60) {
            s = 0;
            m++
        }
        $('.time-start span').text(`
       ${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}
    `)
    }, 1000);
}
//  clearInterval(timer);

function read(content) {
    $('audio').attr('src', srcAudio + content)
    if (autoplayAudio) {
        document.querySelector('audio').play()
    }
}