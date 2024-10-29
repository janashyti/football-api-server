const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendVerificationEmail = (toEmail, username, token) => {
    sendOneButtonEmail({
        to: toEmail,
        from: { name: 'The Recruit Zone', email: 'recruitzone2024@gmail.com' },
        subject: 'Lucky Jacob!',
        imgURL: 'http://cdn.mcauto-images-production.sendgrid.net/9fdee810147efd1c/7c4cdbe7-1ac1-47dc-b331-e861e46eb197/1200x904.jpg',
        firstLine: `Thank your girlfriend for being so loving and amazing, ${username}!`,
        secondLine: 'Please show some love to your girlfriend.',
        thirdLine: 'Thank you!',
        buttonURL: `https://nice-pebble-0c1e97b0f.5.azurestaticapps.net/verify.html?token=${token}`,
        buttonLabel: 'Kiss me'
    })
}

const sendOneButtonEmail = ({ to, from, subject, imgURL, firstLine, secondLine, thirdLine, buttonLabel, buttonURL }) => {

    const mssg = {
        to,
        from,
        subject,
        html: `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd" >
            <html data-editor-version="2" class="sg-campaigns" xmlns="http://www.w3.org/1999/xhtml">
                <head>
                    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1">
                    <!--[if !mso]><!-->
                        <meta http-equiv="X-UA-Compatible" content="IE=Edge">
                    <!--<![endif]-->
                    <!--[if (gte mso 9)|(IE)]>
                        <xml>
                            <o:OfficeDocumentSettings>
                            <o:AllowPNG />
                            <o:PixelsPerInch>96</o:PixelsPerInch>
                            </o:OfficeDocumentSettings>
                        </xml>
                    <![endif]-->
                    <!--[if (gte mso 9)|(IE)]>
                        <style type="text/css">
                            body {width: 600px;margin: 0 auto;}
                            table {border - collapse: collapse;}
                            table, td {mso - table - lspace: 0pt;mso-table-rspace: 0pt;}
                            img {-ms - interpolation - mode: bicubic;}
                        </style>
                    <![endif]-->
                    <link href="https://fonts.googleapis.com/css?family=Muli&display=swap" rel="stylesheet">
                    <style type="text/css">
                        body {
                            display: flex;
                            flex-direction: column;
                            justify-content: center;

                            font-family: 'Muli', sans-serif;
                            max-width: 100%;
                            margin: 0;
                        }

                        #frame{
                            align - self: center;
                            max-width:600px;
                            background-color: #f6f6f6;
                            padding: 20px;
                            margin: 0;
                        }

                        #frame img {
                            align - self: center;
                            max-width: 100%;

                            display:block;
                            color:#000000;
                            text-decoration:none;
                            font-family:Helvetica, arial, sans-serif;
                            font-size:16px;
                        }

                        main {
                            align - self: center;
                            background-color:#ffffff;
                            text-align: center;
                            padding: 0;
                            margin: 0;
                        }

                        #first-line {
                            padding:20px 10px 20px 10px;
                            font-size: 33px;
                            line-height:36px;
                            margin: 0;
                        }

                        #second-line {
                            padding:10px 0 0 0;
                            font-size: 18px;
                            line-height:22px;
                            margin: 0;
                        }

                        #third-line {
                            padding:3px 0 0 0;
                            color: #ffbe00;
                            font-size: 18px;
                            margin: 0;
                        }

                        .button-box {
                            font - size:16px;
                            text-align:center;
                            background-color:"#ffbe00";
                            padding:20px 0px 20px 0px;
                        }

                        .button-box a {
                            background - color:#ffbe00;
                            border:1px solid #ffbe00;
                            border-radius: 6px;
                            color:#000000;
                            display:inline-block;
                            font-size:14px;
                            padding:12px 40px 12px 40px;
                            text-align:center;
                            text-decoration:none;
                        }

                        footer {
                            padding:16px 16px 16px 16px;
                            align-self: center;
                            color:#444444;
                            font-size:12px;
                            line-height:20px;
                        }
                    </style>
                </head>

                <body>
                    <div id="frame">
                        <img class="image" src=${imgURL}
                            width="348px" height="273px"
                            alt="" data-proportionally-constrained="true" data-responsive="false">
                            <main>
                                <p id="first-line">
                                    ${firstLine}
                                </p>
                                <p id="second-line">
                                    ${secondLine}
                                </p>
                                <p id="third-line">
                                    ${thirdLine}
                                </p>
                                <div class="button-box">
                                    <a href=${buttonURL}
                                        target="_blank">${buttonLabel}</a>
                                </div>
                            </main>
                    </div>
                    <footer>
                        Your Fav girl ;) &copy; 2024
                    </footer>
                </body>

                            </html>
    `}

    try {
        sgMail.send(mssg)
        console.log("Sendgrid request sent")
        //console.log(mssg)
    }
    catch (error) {
        console.error(error);

        if (error.response) {
            console.error(error.response.body)
        }
    }
}

module.exports = { sendVerificationEmail }