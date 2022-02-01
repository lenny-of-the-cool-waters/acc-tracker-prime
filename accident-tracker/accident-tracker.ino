// WiFi setup
#include <WiFi.h>
const char ssid[] = "Jeniffer";
const char password[] = "jeff2014";
WiFiClient client;

// ThingSpeak setup
#include <ThingSpeak.h>`
const long CHANNEL = 1401241;
const char *WRITE_API = "QBJ1HO5BPMRLDIPW";
long prevMillisSensor = 0;
int intervalSensor = 2000;
long prevMillisThingSpeak = 0;
int intervalThingSpeak = 20000; // Minimum ThingSpeak write interval is 15 seconds

// Timer variables
unsigned long lastTime = 0;
unsigned long lastTimeTemperature = 0;
unsigned long lastTimeAcc = 0;
unsigned long lastTimeAccident = 0;
unsigned long gyroDelay = 10;
unsigned long temperatureDelay = 1000;
unsigned long accelerometerDelay = 200;
unsigned long accidentDelay = 1000;

boolean accident = false; //accident occurrance

// NEO6M setup
#include <Adafruit_SSD1306.h>
#include <TinyGPS++.h>
#define RXD2 16
#define TXD2 17
HardwareSerial neogps(1);
TinyGPSPlus gps;
float latitude = 180.0;
float longitude = 360.0;

// MPU6050 sensor setup
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>
Adafruit_MPU6050 mpu;
sensors_event_t a, g, temp;
float gyroX, gyroY, gyroZ;
float accX, accY, accZ;
float temperature;

//Gyroscope sensor deviation
float gyroXerror = 0.07;
float gyroYerror = 0.03;
float gyroZerror = 0.04;

// Init MPU6050
void initMPU() {
  if (!mpu.begin()) {
    Serial.println("Failed to find MPU6050 chip");
    while (1) {
      delay(10);
    }
  }
  Serial.println("MPU6050 Found!");
}

// Initialize WiFi
void initWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.println("");
  Serial.print("Connecting to WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(intervalThingSpeak);
    delay(1000);
  }
  Serial.println("");
  Serial.println(WiFi.localIP());
}

// Checking if accident has occurred
void checkAccident() {
  if (accident == true) {
    Serial.println("FALL DETECTED");
  } else {
    mpu.getEvent(&a, &g, &temp);

    boolean trigger1 = true; //stores if first trigger (lower threshold) has occurred
    boolean trigger2 = true; //stores if second trigger (upper threshold) has occurred
    boolean trigger3 = true; //stores if third trigger (orientation change) has occurred
    byte trigger1count = 0; //stores the counts past since trigger 1 was set true
    byte trigger2count = 0; //stores the counts past since trigger 2 was set true
    byte trigger3count = 0; //stores the counts past since trigger 3 was set true
    int angleChange = 0;

    // Get current acceleration values
    accX = a.acceleration.x;
    accY = a.acceleration.y;
    accZ = a.acceleration.z;

    // Get gyro values
    float gyroX_temp = g.gyro.x;
    if (abs(gyroX_temp) > gyroXerror) {
      gyroX += gyroX_temp / 50.00;
    }

    float gyroY_temp = g.gyro.y;
    if (abs(gyroY_temp) > gyroYerror) {
      gyroY += gyroY_temp / 70.00;
    }

    float gyroZ_temp = g.gyro.z;
    if (abs(gyroZ_temp) > gyroZerror) {
      gyroZ += gyroZ_temp / 90.00;
    }


    // calculating Amplitute vactor for 3 axis
    float Raw_Amp = pow(pow(accX, 2) + pow(accY, 2) + pow(accZ, 2), 0.5);
    int Amp = Raw_Amp * 10;  // Mulitiplied by 10 bcz values are between 0 to 1
    Serial.print("Amplitude: ");
    Serial.println(Amp);

    //if AM breaks lower threshold (0.4g)
    if (Amp <= 97 && trigger2 == false) {
      trigger1 = true;
    }
    if (trigger1 == true) {
      trigger1count++;
      if (Amp >= 200) { //if AM breaks upper threshold (3g)
        //       trigger2=true;
        //       trigger1=false;
        //       trigger1count=0;
        accident = true;
      }
    }
    if (trigger2 == true) {
      trigger2count++;
      angleChange = pow(pow(gyroX, 2) + pow(gyroY, 2) + pow(gyroZ, 2), 0.5);
      //if orientation changes by between 80-100 degrees
      if (angleChange >= 30 && angleChange <= 400) {
        trigger3 = true; trigger2 = false; trigger2count = 0;
      }
    }
    if (trigger3 == true) {
      trigger3count++;
      if (trigger3count >= 10) {
        angleChange = pow(pow(gyroX, 2) + pow(gyroY, 2) + pow(gyroZ, 2), 0.5);
        //if orientation changes remains between 0-10 degrees
        if ((angleChange >= 0) && (angleChange <= 10)) {
          accident = true; trigger3 = false; trigger3count = 0;
          delay(1000);
        } else {
          trigger3 = false; trigger3count = 0;
        }
      }
    }
    //    Serial.println("No Accident");
  }
}

void setup() {
  Serial.begin(115200);
  //Begin serial communication Neo6mGPS
  neogps.begin(9600, SERIAL_8N1, RXD2, TXD2);
  Serial.println();
  WiFi.mode(WIFI_STA);
  ThingSpeak.begin(client); // Initialize ThingSpeak
  initMPU();

  // Setting Accelerometer & Gyro range
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  Serial.print("Accelerometer range set to: ");
  switch (mpu.getAccelerometerRange()) {
    case MPU6050_RANGE_2_G:
      Serial.println("+-2G");
      break;
    case MPU6050_RANGE_4_G:
      Serial.println("+-4G");
      break;
    case MPU6050_RANGE_8_G:
      Serial.println("+-8G");
      break;
    case MPU6050_RANGE_16_G:
      Serial.println("+-16G");
      break;
  }
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  Serial.print("Gyro range set to: ");
  switch (mpu.getGyroRange()) {
    case MPU6050_RANGE_250_DEG:
      Serial.println("+- 250 deg/s");
      break;
    case MPU6050_RANGE_500_DEG:
      Serial.println("+- 500 deg/s");
      break;
    case MPU6050_RANGE_1000_DEG:
      Serial.println("+- 1000 deg/s");
      break;
    case MPU6050_RANGE_2000_DEG:
      Serial.println("+- 2000 deg/s");
      break;
  }

  mpu.setFilterBandwidth(MPU6050_BAND_5_HZ);
  Serial.print("Filter bandwidth set to: ");
  switch (mpu.getFilterBandwidth()) {
    case MPU6050_BAND_260_HZ:
      Serial.println("260 Hz");
      break;
    case MPU6050_BAND_184_HZ:
      Serial.println("184 Hz");
      break;
    case MPU6050_BAND_94_HZ:
      Serial.println("94 Hz");
      break;
    case MPU6050_BAND_44_HZ:
      Serial.println("44 Hz");
      break;
    case MPU6050_BAND_21_HZ:
      Serial.println("21 Hz");
      break;
    case MPU6050_BAND_10_HZ:
      Serial.println("10 Hz");
      break;
    case MPU6050_BAND_5_HZ:
      Serial.println("5 Hz");
      break;
  }
}

void ts() {
  // Set the fields with the values
  ThingSpeak.setField(1, a.acceleration.x);
  ThingSpeak.setField(2, a.acceleration.y);
  ThingSpeak.setField(3, a.acceleration.z);
  ThingSpeak.setField(4, accident);
  ThingSpeak.setField(5, temp.temperature);
  ThingSpeak.setField(6, latitude);
  ThingSpeak.setField(7, longitude);

  // Write to the ThingSpeak channel
  int x = ThingSpeak.writeFields(CHANNEL, WRITE_API);
  if (x == 200) {
    Serial.println("Channel update successful.");
  }
  else {
    Serial.println("Problem updating channel. HTTP error code " + String(x));
  }
}

void getLocation() {  
  if (gps.location.isValid() == 1) {
    latitude = (gps.location.lat());
    longitude = (gps.location.lng());

    Serial.print("Lat: ");
    Serial.println(latitude, 6);
    Serial.print("Lng: ");
    Serial.println(longitude, 6);
    Serial.print("Speed: ");
    Serial.println(gps.speed.kmph());
    Serial.print("ALT:");
    Serial.print(gps.altitude.meters(), 0);
    Serial.println("\n");
  } else {
    Serial.print("No Data \n");
  }
}

void loop() {
  // Connect or reconnect to WiFi
  //   initWiFi();
  if (WiFi.status() != WL_CONNECTED) {
    Serial.print("Attempting to connect to SSID: ");
    Serial.println(ssid);
    while (WiFi.status() != WL_CONNECTED) {
      WiFi.begin(ssid, password);
      Serial.print(".");
      delay(500);
    }
  }

  int timer = 0;
  boolean newData = false;
  while (timer < intervalThingSpeak) {
    checkAccident();
    while (neogps.available()) {
      if (gps.encode(neogps.read())) {
        newData = true;
      }
    }

    //If newData is true
    if (newData == true) {
      newData = false;
      Serial.print("Number of satellites: ");
      Serial.println(gps.satellites.value());
      getLocation();
    } else {
      Serial.println("No new data");
    }

    timer += accidentDelay;
    delay(accidentDelay);
  }

  ts();
}
