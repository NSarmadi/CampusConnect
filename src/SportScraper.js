import React from 'react';
import { useState } from 'react';
import { View } from 'react-native';
import uuid from 'react-native-uuid';


const cheerio = require("react-native-cheerio");
const url = "https://gamecocksonline.com/all-sports-schedule/";
const DEFAULTGAMECOCKLOGOURL1 = "https://gamecocksonline.com/imgproxy/VExob3ytGj5BNypACaYPkvTj1hVPGnHWGjUKiE5kZyY/fit/100/100/ce/0/aHR0cHM6Ly9zdG9yYWdlLmdvb2dsZWFwaXMuY29tL2dhbWVjb2Nrc29ubGluZS1jb20vMjAyMi8wNS8yYjlkMWU4Ny1zb3V0aF9jYXJvbGluYV9nYW1lY29ja3NfbG9nb19wcmltYXJ5LnBuZw.png";
const DEFAULTGAMECOCKLOGOURL2 = "https://gamecocksonline.com/imgproxy/T5189nCorf3M6wYfR1fANLkiT4Dn31rTEbUh6hXtvAU/fit/150/150/ce/0/aHR0cHM6Ly9zdG9yYWdlLmdvb2dsZWFwaXMuY29tL2dhbWVjb2Nrc29ubGluZS1jb20vMjAyMi8xMS9iOGI1MWI3ZC1zY19nYW1lY29ja3NfYmFzZWJhbGxfc29mdGJhbGxfaW50ZXJsb2NrX2xvZ28ucG5n.png";
const DEFAULTSECLOGO = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Southeastern_Conference_logo.svg/1200px-Southeastern_Conference_logo.svg.png"
const BEACHVOLLEYBALLLOGO = "https://gamecocksonline.com/imgproxy/hS1VvuQwMq70zW6pa9zdKvEEtN7B-FeUkPjM3TFz1Zc/fit/150/150/ce/0/aHR0cHM6Ly9zdG9yYWdlLmdvb2dsZWFwaXMuY29tL2dhbWVjb2Nrc29ubGluZS1jb20vMjAxOC8wMy9iYjE2MDQ5Yi1zY2FyLWJlYWNoLXZvbGxleWJhbGwtbG9nby5qcGc.png"
const Nightmare = require('nightmare');


export async function ScrapeSportData() {
  try {
  return await LoadSportEvents();
  }
  catch (error) {
    console.log("Load error");
  }
}

// export async function ScrapeMoreSportData() {
//   try {
//     return await LoadMoreSportEvents();
//   } catch (error) {
//     console.log('Load More error');
//   }
// }


const LoadSportEvents = async() => {
    // if (events == null)
    //   events = new Array();
    events = new Array();
    const response = await fetch(url);
    // response = await fetch('https://gamecocksonline.com/wp-json/v1/all_sports_schedule?offset='+pageNum+'&game_status=');  // fetch page
    const htmlString = await response.text();  // get response text
    const $ = cheerio.load(htmlString); // parse HTML string
    // thisEventCount = htmlString.count;
    // isFull = htmlString.is_full_list;
    
    listItems = $(".schedule-list__category");
    sportList = $(".schedule-list__category");
    opponentList = $(".schedule-list__opponent");
    scheduleList = $(".schedule-list__top");
    imageList = $(".schedule-list__image");
    locationList = $(".schedule-list__location");
    
    sportArray = new Array();
    opponentArray = new Array();
    dateArray = new Array();
    timeArray = new Array();
    imageArray = new Array();
    locationArray = new Array();
    homeStatusArray = new Array();
    
    sportList.each((i, el) => {
      sportArray.push(($(el).text().trim()));
    })
    
    opponentList.each((i, el) => {
      opponentArray.push($(el).children("strong").text());
    })

    scheduleList.each((i, el) => {
      dateArray.push($(el).children("time").text().split("\n      ")[0]);
      timeArray.push($(el).children("time").text().split("\n      ")[1]);
    })

    imageList.each((i, el) => {
      img = ($(el).children("img").attr("src"));
      //console.log("IMG: " + img);
      if (img === undefined) 
        imageArray.push(DEFAULTSECLOGO); // Use SEC logo if there's no opponent logo
      if (img != DEFAULTGAMECOCKLOGOURL1 && img != DEFAULTGAMECOCKLOGOURL2 && img != BEACHVOLLEYBALLLOGO) // Ensures that Gamecock logo isn't used for opponent logo
        imageArray.push(img);
    })

    locationList.each((i, el) => {
      locationArray.push($(el).children("strong").text());
      homeStatusArray.push($(el).children("span").text());
    })


    const attributes = 8;
    let arr = Array(10).fill().map(() => Array(attributes));
    for (let i = 0; i < 10; i++) {
        arr[i][0] = sportArray[i];
        arr[i][1] = opponentArray[i];
        arr[i][2] = dateArray[i];
        arr[i][3] = timeArray[i];
        arr[i][4] = imageArray[i];
        arr[i][5] = uuid.v4();
        arr[i][6] = locationArray[i];
        arr[i][7] = homeStatusArray[i];
      }
      //events.push(arr);
      return arr;
}

// const LoadMoreSportEvents = async() => {
//   console.log("test!");
// }
