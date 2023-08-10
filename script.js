$(document).ready(() => {
    console.log('ready!');
    // user is logged in, display transaction table with txn
    if (sessionStorage.length >= 1 && sessionStorage.getItem('loggedIn')) {
        loggedInStateUi();
        getUserTxn();
    } else {
        loggedOutStateUi();
    }

    // login event handler
    $('#login').on('submit', (event) => {
        event.preventDefault();

        isAuthUser = authenticateUser()
        if (isAuthUser) {
            // user is successfully logged in
            loggedInStateUi();
            getUserTxn();
        } else {
            // failed log in - error message (currently not working)
            $("#errorLogin").show();
            $("#errorMessage").html("Unable to log in. Please verify your email address and password is correct");
        }

    })
    // create transaction event handler
    $('#transaction').on('submit', (event) => {
        event.preventDefault();
        createUserTxn();
    })

    // display transaction event handler
    $('#getTxn').on('submit', (event) => {
        event.preventDefault();
        console.log("here");
        getUserTxn();
    })
});

const authenticateUser = () => {
    // These env variables are stored on heroku dashboard

    const options = `&partnerName=applicant&partnerPassword=d7c3119c6cdab02d68d9`
    const formData = $('#login').serialize().concat(options);
    $.ajax({
        url: 'proxy.php?url=https://www.expensify.com/api?command=Authenticate',
        type: 'POST',
        data: formData,
    })
        .then((data) => {
            sessionStorage.setItem('loggedIn', true)
            console.log(`auth user request was successfully: ${data}`)
        }).catch((err) => {
            console.log(`failed to auth user. ${err}`)
            return false;
        });
    return true;
}

const getUserTxn = () => {
    $.ajax({
        url: 'proxy.php?url=https://www.expensify.com/api?command=Get',
        data: {
            returnValueList: 'transactionList',
        },
    })
        .then((data) => {
            const resp = JSON.parse(data);
            if (resp["status"] === 'error') {
                loggedOutStateUi();
                return;
            }
            // paginate transaction items
            generateItems(resp["transactionList"]);

        }).catch((data) => {
            console.log(JSON.stringify(data));
        });
}

const createUserTxn = () => {
    const formData = $('#transaction').serialize()
    $.ajax({
        url: 'proxy.php?url=https://www.expensify.com/api?command=CreateTransaction',
        type: 'POST',
        data: formData,
    })
        .then((data) => {
            closeModal();
            const resp = JSON.parse(JSON.stringify(data));
            if (resp["status"] === 'error') {
                loggedOutStateUi();
                return;
            } else {
                const tbody = document.getElementById('transactionTableBody');
                const row = tbody.insertRow();

                const date_col = row.insertCell();
                date_col.textContent = resp[0].inserted.split(" ")[0];

                const merchant_col = row.insertCell();
                merchant_col.textContent = resp[0].merchant;

                const amount_col = row.insertCell();
                amount_col.textContent = resp[0].amount;
            }
        })
        .catch((err) => {
            console.error(JSON.stringify(err));
        })
}

const openModal = () => {
    document.getElementById("transactionModal")
        .style.display = "block";
}

const closeModal = () => {
    document.getElementById("transactionModal")
        .style.display = "none";
}

const errorBanner = () => {
    document.getElementById("errorLogin")
        .style.display = "none";
}

const loggedInStateUi = () => {
    $("#loginContent").hide();
    $("#errorLogin").hide();
    $("#transactionTable").show();
    $("#transactionForm").show();
}

const loggedOutStateUi = () => {
    sessionStorage.removeItem('loggedIn');
    $("#loginContent").show();
    $("#errorLogin").hide();
    $("#transactionTable").hide();
    $("#transactionForm").hide();
}


const generateItems = (txnDataset) => {
    let pageIdx = 0;
    let itemsPerPage = 200;

    txnDataset.sort((a, b) => new Date(b.inserted) - new Date(a.inserted));

    const tbody = document.getElementById('transactionTableBody');

    for (let i = pageIdx * itemsPerPage; i < (pageIdx * itemsPerPage) + itemsPerPage; i++) {
        if (!txnDataset[i]) {
            break;
        }

        const row = tbody.insertRow();

        const date_col = row.insertCell();
        date_col.textContent = txnDataset[i].inserted.split(" ")[0];

        const merchant_col = row.insertCell();
        merchant_col.textContent = txnDataset[i].merchant;

        const amount_col = row.insertCell();
        amount_col.textContent = txnDataset[i].amount;
    }
    generatePageIdx(txnDataset, pageIdx, itemsPerPage);
}

const generatePageIdx = (txnDataset, pageIdx, itemsPerPage) => {
    const tbody = document.getElementById('transactionTable');
    const nav = tbody.querySelector('#nav');

    nav.innerHTML = "";

    for (let i = 0; i < (txnDataset.length / itemsPerPage); i++) {
        const span = document.createElement('span');
        span.innerHTML = i + 1;
        span.addEventListener('click', (e) => {
            console.log('clicked');
            pageIdx = e.target.value;
            generateItems(txnDataset);
        })
        nav.append(span);
    }
}