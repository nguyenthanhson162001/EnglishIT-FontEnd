window.onload = async() => {
    await configureClient();
    getExam()
    updateUIAndSetStorage();
    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {
        // Process the login state
        await auth0.handleRedirectCallback();
        updateUIAndSetStorage();
        // Use replaceState to redirect the user away and remove the querystring parameters
        window.history.replaceState({}, document.title, "/");

    }
};
async function send_token() {
    try {
        // Get the access token from the Auth0 client
        if (auth0 == null) {
            console.log('require login1')
            return
        }
        const token = await auth0.getTokenSilently();
        // Make the call to the API, setting the token
        // in the Authorization header
        const response = await fetch(`${url}/api/external`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        // Fetch the JSON result
        const responseData = await response.json();

        // Display the result in the output element
        console.log(JSON.stringify(responseData, {}, 2))

    } catch (e) {
        // Display errors in the console
        console.error(e);
    }
};
getUnit()
async function getUnit() {
    const response = await fetch(`${url}/api/unit/getunits`);
    const data = await response.json();
    var units = data.units
    const partUnit = units.map(function(unit) {
        return `<div class="card-unit" id='unit_${unit.id}'>
                    <div class="header">
                        <div class="mask">
                            <div class="border">
                                <a href='/exam.html?unit=${unit.slug}&process=english-vietnamese' class='mask-pill anh-viet'>
                                    <span>Anh - việt</span>
                                    <small class="percent">Completed</small>
                                </a>
                            </div>

                            <div class="border">
                                <a href='/exam.html?unit=${unit.slug}&process=vietnamese-english ' class='mask-pill viet-anh'>
                                    <span>Việt - Anh</span>
                                      <small class="percent">0</small>
                                </a>
                            </div>
                        </div>
                        <div class="card-unit-image">
                            <img src="${url}/images/${unit.backgroudImage}" alt="">
                        </div>
                    </div>
                    <div class="content">

                        <h3 class="title">
                        ${unit.name}    
                        </h3>
                        <p class="description">
                        ${unit.description}
                        </p>
                    </div>
                    <div class="footer">
                        <div class="info">
                            <div class='quantity-user'>
                                <i class="fad fa-users icon"></i>
                                <i class='quantity'>${unit.subscriber}</i>
                            </div>
                            <div class="quantity-vocabulary">
                                <i class="">Vocabulary: </i>
                                <i class='quantity'>25</i>
                            </div>
                        </div>
                        <div class="percent-complete">
                            <i class="present">0%</i>
                        </div>
                    </div>
                </div>`
    })
    document.querySelector('.card-units').innerHTML = partUnit.join(' ')
}
// using change precent complete
//
async function getExam() {
    try {
        // Get the access token from the Auth0 client
        if (auth0 == null) {
            console.log('require login1')
            return
        }
        const token = await auth0.getTokenSilently();
        const response = await fetch(`${url}/api/exam/getexam`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        let units = {}
        const result = await response.json();
        // console.log(JSON.stringify(result, {}, 2))
        result.exam.forEach(function(exam) {
            if (exam.process_id == 1) {
                // process English - Viotnamese
                $('head').append(`<style>  #unit_${exam.unit_id}:hover .mask .anh-viet:before{width:${exam.percentComplete}% !important;}</style>`);
                showPercent(exam.unit_id, '.anh-viet', exam.percentComplete)
            } else {
                // process Viotnamese - English
                $('head').append(`<style>  #unit_${exam.unit_id}:hover .mask .viet-anh:before{width:${exam.percentComplete}% !important;}</style>`);
                showPercent(exam.unit_id, '.viet-anh', exam.percentComplete)
            }

            function showPercent(unit_id, process, percentComplete) {
                console.log(unit_id, process, percentComplete)
                if (percentComplete >= 100) {
                    $(` #unit_${unit_id} ${process} .percent`).text('Completed')
                } else {
                    $(` #unit_${unit_id} ${process} .percent`).text(`${percentComplete}%`)
                }
            }
            if (units[exam.unit_id]) {
                units[exam.unit_id] += exam.percentComplete

            } else {
                units[exam.unit_id] = exam.percentComplete
            }
        })
        for (unit in units) {
            // console.log(unit + ' = ' + units[unit])
            $('head').append(`<style>  #unit_${unit} .footer .percent-complete:before{width:${units[unit] / 2}% !important;}</style>`);
            $(`#unit_${unit} .footer .present`).text(`${units[unit] / 2}%`)
        }

    } catch (e) {
        // Display errors in the console
        console.error(e);
    }
}