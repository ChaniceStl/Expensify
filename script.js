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
    const options = '&partnerName=applicant&partnerPassword=d7c3119c6cdab02d68d9'
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
        dataType: 'json',
        data: {
            returnValueList: 'transactionList',
        },
    })
        .then((data) => {
            resp = JSON.parse(data);
            // auth token expired, show sign in flow
            if (resp.jsonCode === 407) {
                loggedOutStateUi();
                return
            }
            const tbody = document.getElementById('transactionTableBody');
            resp.transactionList.forEach(txn => {
                const row = tbody.insertRow();

                const date_col = row.insertCell();
                date_col.textContent = txn.inserted.split(" ")[0];

                const merchant_col = row.insertCell();
                merchant_col.textContent = txn.merchant;

                const amount_col = row.insertCell();
                amount_col.textContent = txn.amount;
            })

        }).catch((err) => {
            console.error(`failed to get txn: ${err}`)
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
            resp = JSON.parse(data);
            // auth token expired
            if (resp.jsonCode === 407) {
                loggedOutStateUi();
            }
        })
        .catch((err) => {
            console.error(`ERROR: ${err}`);
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