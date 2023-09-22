const cheerio = require('cheerio')
const axios = require('axios')
const isURLhttp = require('is-url-http')
const Knwl = require('knwl.js')
const knwlInstance = new Knwl()
knwlInstance.register("phone",require('knwl.js/default_plugins/phones'))
knwlInstance.register("address",require('knwl.js/default_plugins/places'))

const examples = [
    "info@1stchoiceframes.co.uk", //only returns address
    "info@workwearoutlet.co.uk",  //
    "info@powertooldirect.co.uk", //returns phone number
    "info@onesvs.co.uk",  //returns phone nummber
    "info@easyprintltd.co.uk", //returns address
    "info@shethsinteriors.co.uk",  // 
    "info@northernpropertycontractors.co.uk", 
    "info@vital-life.co.uk", // returns phone number
    "info@zoomrecruitment.co.uk", // returns both
    "info@blackburnyz.org", //
    "info@nightsafe.org", //Returns many phone numbers
    "info@cumminsmellor.co.uk", //returns phone number
]

var UsefulInfo = []
let strippedArrays = []

//Converts each email into a readable domain
examples.forEach((ele) => {
    var split = ele.split("@")
    strippedArrays.push(`https://${split[1]}/`)
})

async function ScrapeWebsite(){

    for (i=0;i<strippedArrays.length;i++){
        try {
            const currentWebsite = strippedArrays[i]
            const response = await axios.request({
                method: "GET",
                url: currentWebsite,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
                }
            })
            const $ = cheerio.load(response.data)
            var contactURL = ""
   
           $("a, span").each((index,val) => {
                if ($(val).attr("href")){
                    if ($(val).text().toLowerCase().includes("contact")){
                        contactURL = $(val).attr("href")
                        return false
                    }
                }
            }) 

            while (contactURL[0] == "/"){
                contactURL = contactURL.substring(1) //Makes sure there is only 1 / 
            }

            validURL = currentWebsite
            if (contactURL){
                if (isURLhttp(contactURL)){
                    validURL = contactURL
                } else if (isURLhttp(currentWebsite + contactURL) && (contactURL.toLowerCase().includes("contact"))){
                    validURL = strippedArrays[i] + contactURL
                }
            }

            const contactResponse = await axios.request({
                method: "GET",
                url: validURL,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
                }
            })



            const $$ = cheerio.load(contactResponse.data)
            const PhoneNumberRegex =  /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|\+)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|\#)\d{3,4})?$/  // /^(\+{1}\d{2,3}\s?[(]{1}\d{1,3}[)]{1}\s?\d+|\+\d{2,3}\s{1}\d+|\d+){1}[\s|-]?\d+([\s|-]?\d+){1,2}$/
           // const AddressRegex = /^(([gG][iI][rR] {0,}0[aA]{2})|((([a-pr-uwyzA-PR-UWYZ][a-hk-yA-HK-Y]?[0-9][0-9]?)|(([a-pr-uwyzA-PR-UWYZ][0-9][a-hjkstuwA-HJKSTUW])|([a-pr-uwyzA-PR-UWYZ][a-hk-yA-HK-Y][0-9][abehmnprv-yABEHMNPRV-Y]))) {0,}[0-9][abd-hjlnp-uw-zABD-HJLNP-UW-Z]{2}))$/

            var Numbers = []
            var Locations = []

         /*   $$('body *').filter(function () {
                 knwlInstance.init($(this).text())
                var phoneNumber = knwlInstance.get("phone")
                var address =  knwlInstance.get("address")
                address.forEach((address) => {
                    Locations.push(address.place)
                })  

                phoneNumber.forEach((number) => {
                    Numbers.push(number.phone)
                }) 
                var text = $$(this).text()
                if ($$(this).attr("href")){
                    if (($$(this).attr("href")).replace(/\D/g,'').search(PhoneNumberRegex) !== -1){
                        return true
                    }
                }
                if (text == ''){
                    return false
                }
                var justNumbers = text.replace(/\D/g,'')
                if (justNumbers )

                return (justNumbers).search(PhoneNumberRegex) !== -1     //   PhoneNumberRegex.test($(this).text());
                })
                .each(function () {
                    var obj = $$(this)
                    if (obj.attr("href")) {
                        Numbers.push(obj.attr("href").replace(/\D/g,' '));
                        
                    }

                    noOfNumbers= obj.text().split(/\s+/)
                    noOfNumbers.forEach((val) => {
                        Numbers.push(val)
                    })
                    
                    Numbers.push(obj.text().replace(/\D/g,''));

                    
                    
                }); */
                $$('body *').each(function () {
                    var obj = $$(this)
                    var text = obj.text()
                    if (text !== ''){
                        var justNumbers = text.replace(/\D/g,'')
                        var splitNumbers = text.replace(/\D/g,' ').split(/\s{2,}/)
    
                      /*  splitNumbers.forEach((val) => {
                            if (val.replace(/\D/g,'').search(PhoneNumberRegex) !== -1){
                                Numbers.push(val.replace(/\D/g,''))
                            }
                        }) */

                        if ((justNumbers).search(PhoneNumberRegex) !== -1 ){
                            Numbers.push(justNumbers);
                        } else {
                            text.replace(/\D/g,' ').split(/\s{2,}/).forEach((val) => {
                                if (val.replace(/\D/g,'').search(PhoneNumberRegex) !== -1){
                                    Numbers.push(val.replace(/\D/g,''))
                                }
                            })
                        }
                    }
                    if (obj.attr("href")){
                        if ((obj.attr("href")).replace(/\D/g,'').search(PhoneNumberRegex) !== -1){
                            Numbers.push(obj.attr("href").replace(/\D/g,' '))
                        }
                    }
                  
                /*    if (text !== ''){
                        if ((justNumbers).search(PhoneNumberRegex) !== -1 ){
                            Numbers.push(justNumbers);
                        } else if{

                        } 

                    } */
                })
            



            UsefulInfo.push({potentialNumbers : Numbers, potentialLocal: Locations, contact: validURL}) 

        } catch(error) {
            console.log(error)
            return
        } 

      
    }

    console.log(UsefulInfo)
}

ScrapeWebsite()