$(document).ready(() => {
    console.log('ready!');
    // inital view
    if (sessionStorage.length >= 1) {
        $("#loginContent").hide();
        $("#errorLogin").hide();
        $("#transactionTable").show();
        $("#transactionForm").show();
        getUserTxn();
    } else {
        $("#loginContent").show();
        $("#errorLogin").hide();
        $("#transactionTable").hide();
        $("#transactionForm").hide();
    }

    // login event handler
    $('#login').on('submit', (event) => {
        event.preventDefault();

        isAuthUser = authenticateUser()
        if (isAuthUser) {
            $("#loginContent").hide();
            $("#transactionTable").show();
            $("#transactionForm").show();
            getUserTxn();
        } else {
            // error handle display logic
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
            resp = JSON.parse((data));
            if (resp.jsonCode >= 400) {
                console.log("DAMN")
                return resp.title
            }
            const tbody = document.getElementById('transactionTableBody');
            console.log(typeof resp);
            resp.transactionList.forEach(txn => {
                const row = tbody.insertRow();

                const date_col = row.insertCell();
                date_col.textContent = txn.created;

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
    // hard coded data
    $.ajax({
        url: 'proxy.php?url=https://www.expensify.com/api?command=CreateTransaction',
        type: 'POST',
        data: {
            created: '2023-06-29',
            amount: 200000,
            merchant: 'Amiri',
        },
    })
        .then((data) => {
            console.log(`Successfully ${data}`);
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