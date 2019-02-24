const Discord = require(`discord.js`);
const client = new Discord.Client();
const auth = require(`./auth`);
const ytdl = require(`ytdl-core`);
const {google} = require(`googleapis`);

let voiceChannel = null;
isPlaying = false;
switchChannel = true;

client.on(`message`, msg => {
    hasSpace = msg.content.indexOf(` `) !== -1;
    if(msg.content.charAt(0) === `!`) {
        if(msg.channel.id === auth.channelId) {
            switch (hasSpace ? msg.content.substring(1, msg.content.indexOf(` `)) : msg.content.substring(1)) {
                case `play`: {
                    if(msg.member.voiceChannel && msg.member.voiceChannel.id === auth.voiceChannelId) {
                        voiceChannel = msg.member.voiceChannel;
                        let songName = hasSpace ? msg.content.substring(msg.content.indexOf(` `) + 1) : ``;
                        if (songName.length) {
                            playSong(songName); 
                        }
                        else {
                            msg.reply(`you must provide a song name`);
                        }
                    }
                    else {
                        msg.reply(`you must be in party-time voice channel`);
                    }
                    break;
                }
                case `leave`: {
                    voiceChannel.leave();
                    break;
                }
            }
        } else {
            msg.reply(`you don't have the aux`)
        }
    } 
});

playSong = (songName) => {
    let params = {
        'maxResults': '1',
        'part': 'snippet',
        'q': songName,
        'type': ''
    };
    let service = google.youtube({
        version: 'v3',
        auth: auth.key
    });
    service.search.list(params, function(err, response) {
        if (err || !response.data.items.length) {
          client.sendMessage(`failed to find song`)
          return;
        }
        let song = response.data.items[0];
        connectToChannel(song.id.videoId);
    });
}

connectToChannel = (songId) => {
    let stream = ytdl('http://www.youtube.com/watch?v=' + songId, {filter: 'audioonly'});
    voiceChannel.join()
        .then(connection => {
            let dispatcher = connection.playStream(stream);
        });
}

client.login(auth.token);