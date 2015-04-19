//
//  ViewController.swift
//  accelerometerTest
//
//  Created by Rishi Masand on 4/14/15.
//  Copyright (c) 2015 Rishi Masand. All rights reserved.
//

import UIKit
import CoreMotion
import CoreLocation

class ViewController: UIViewController, CLLocationManagerDelegate {
    
    var motionManager = CMMotionManager()
    var locationManager = CLLocationManager()
    var num = 1
    
    let socket = SocketIOClient(socketURL: "http://a611467e.ngrok.io")

    override func viewDidLoad() {
        super.viewDidLoad()
        socket.connect()
        
        locationManager.delegate = self
        locationManager.requestWhenInUseAuthorization()
        locationManager.requestAlwaysAuthorization()
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.distanceFilter = 1;
        locationManager.startUpdatingLocation()
        
        var device = UIDevice.currentDevice()
        device.proximityMonitoringEnabled = true
        
        if (motionManager.accelerometerAvailable) {
            let queue = NSOperationQueue()
            motionManager.startAccelerometerUpdatesToQueue(queue, withHandler:
                {(data: CMAccelerometerData!, error: NSError!) in
                    
                    if (data.acceleration.z >= 2 || data.acceleration.z <= -2) {
                        println("Z = \(data.acceleration.z)")
                        self.socket.emit("knock")
                        self.socket.emit("where", self.fullThing)
                    }
                    
                }
            )
        }
        else {
            println("Accelerometer is not available")
        }
        
    }
    
    @IBAction func buttonWasTapped(sender: AnyObject) {
        println("Tapped")
    }
    
    func locationManager(manager: CLLocationManager!, didUpdateLocations locations: [AnyObject]!) {
        CLGeocoder().reverseGeocodeLocation(manager.location, completionHandler: { (placemarks, error) -> Void in
            
            if (error != nil) {
                    println(error.localizedDescription)
                return
            }
            
            if placemarks.count > 0 {
                let pm = placemarks[0] as CLPlacemark
                self.displayLocationInfo(pm)
            }
            
        })
        
        num += 1
        //println("Updating \(num)")
        var dataString = "Updating \(num)"
        //socket.emit("data", dataString)
        
    }
    
    var fullThing: String!
    
    func displayLocationInfo(placemark: CLPlacemark) {
        println(placemark.locality)
        println(placemark.postalCode)
        println(placemark.administrativeArea)
        println(placemark.country)
        fullThing = "\(placemark.locality) \(placemark.postalCode) \(placemark.administrativeArea) \(placemark.country)"
        
    }
    
    func locationManagerDidResumeLocationUpdates(manager: CLLocationManager!) {
        println("Resuming")
    }

}

