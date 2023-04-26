var request = require('request');
var cheerio = require('cheerio');
var nodemailer = require('nodemailer');
var jsonData = require('./credentials.json');

//Use process.argv[] to read in specified artists by command line
const artists = [];
const arrOfArtists = [];
const arrOfSongs = [];
var finalArtists = 'Your artists are: '; 

//Flag that dictates whether email will be sent
let emailSent = false;

//Stores all artists in here
for (var i = 2; i < process.argv.length; i ++) {
    artists.push(process.argv[i]);
}

//This needs to be moved into a continuous loop
if (artists == null) {
    console.log('please specify artist');
}

else{

    request('http://www.popvortex.com/music/charts/top-rap-songs.php', function(error, body, html) {
        //if artist is not found do not send email 
        
        //else { send email using nodemailer}
        if (!error && body.statusCode==200) {
            var $ = cheerio.load(html);
            var htmlData=[];

            for (var i = 0; i < artists.length; i ++) {
                //Checks through artist first
                $('em.artist').each(function(index, element) {
                    if ($(this).text().includes(artists[i])) {
                        arrOfSongs.push($(this).prev().text());
                        arrOfArtists.push($(this).text());
                        //Set boolean to success so email can be sent
                        emailSent=true;
                    }
                })

                //This checks for feat. artist
                $('cite.title').each(function(index, element) {
                    if ($(this).text().includes('feat. ' + artists[i])) {
                        arrOfSongs.push($(this).text());
                        arrOfArtists.push($(this).next().text());
                        //Set boolean to success so email can be sent
                        emailSent=true;
                    }
                })
                if (emailSent == false) {
                    console.log (artists[i] + ' has not been found');
                }
            }
            //Include loop that combines with "<strong>" so it can be added to email
            for (var i =0; i < arrOfArtists.length; i++) {
                htmlData+=('<strong>' + arrOfArtists[i] + ': </strong><em>' + arrOfSongs[i] + '</em><br></br>');
            }
            //Sets format of subject line
            if (artists.length==2) {
                finalArtists += artists[0] + ' and ' + artists[1];
            }
            else {
                for (var i = 0; i < artists.length; i++) {
                    if (i == artists.length - 1) {
                        finalArtists += ' and ' + artists[i];
                    }
                    else  {
                        finalArtists += artists[i] + ', ';
                    }
                }
            }
            //Only sends the message if an artist is found
            if (emailSent== true) {
                let transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true,
                    auth: {
                        user: jsonData.sender_email,
                        pass: jsonData.sender_password
                    }
                })
                let mailOptions = {
                    from: jsonData.from,
                    to: jsonData.to,
                    subject: finalArtists,
                    html: htmlData
                }
                transporter.sendMail(mailOptions);
            }
            else {
                //If artist is not found then email is not sent and error message pops up
                console.log("Artist has not been found. Email has not been sent");
            }

        }
        else {
            console.log(error);
        }
    });
}