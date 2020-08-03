import React from 'react'
import {Text,View,TouchableOpacity,StyleSheet,TextInput,Image} from 'react-native'
import * as Permissions from 'expo-permissions'
import {BarCodeScanner} from 'expo-barcode-scanner'
import * as firebase from 'firebase'
import db from '../config'
export default class TransactionScreen extends React.Component{
  constructor(){
    super()
      this.state={
        hascamerapermission:null,
        scanned:false,
        scanndata:'',
        buttonState:'normal' ,
        scannedBookId:'',
        scanStudentId:'',
        transactionmsg:'',
        
      }
    

    
  }

  handleTransaction =async()=>{
 var transactionmsg = null; 
 db.collection("books")
 .doc(this.state.scannedBookId).get().then((doc)=>{
   var book = doc.data()
   if(book.bookavailibility){
     this.initiatebookissue();
     transactionmsg = "book issued"
   }
   else{
     this.initiatebookreturn()
     transactionmsg = "book returned"
   }
 })
 this.setState({transactionmsg:transactionmsg})
  }
  initiatebookissue = async()=>{
    db.collection("transactions").add({
      "studentID":this.state.scanStudentId,
      "bookID":this.state.scannedBookId,
      "date":firebase.firestore.Timestamp.now().toDate(),
      "transcationType":"issue"
        })
        db.collection("books").doc(this.state.scannedBookId)
        .update({"bookavailibility":false})
        db.collection("students").doc(this.state.scanStudentid)
        .update({"noofbooksissued":firebase.firestore.FieldValue.increment(1)})
   Alert.alert("book issued")
   this.setState({scanBookId:"",scanStudentId:""})     
  }
  initiatebookreturn = async()=>{
    db.collection("transactions").add({
      "studentID":this.state.scanStudentId,
      "bookID":this.state.scannedBookId,
      "date":firebase.firestore.Timestamp.now().toDate(),
      "transcationType":"return"
        })
        db.collection("students").doc(this.state.scanStudentId)
        .update({"bookavailibility":true})
        db.collection("students").doc(this.state.scanStudentid)
        .update({"noofbooksissued":
        firebase.firestore.FieldValue.increment(-1)})
   Alert.alert("book returned")
   this.setState({scanBookId:"",scanStudentId:""})     
  }
  getcamerapermission= async(id)=>{
   const {status} = await Permissions.askAsync(Permissions.CAMERA);
   this.setState({hascamerapermission:status==="granted",
   buttonState:id,scanned:false})
  }
  handlebarcodescanner= async({type,data})=>{
    const {buttonState} = this.state
    if(buttonState==="bookid"){
      this.setState({
        scanned:true,
        scanBookId:data,
        buttonState:normal
      })
    }
    else if(buttonState==="studentid"){
    this.setState({scanned:true,buttonState:'normal',
    scanStudentId:data})
  }}
   render(){
     const hascamerapermission = this.state.hascamerapermission; 
     const scanned = this.state.scanned
     const buttonState = this.state.buttonState
     if(buttonState!=="normal"&& hascamerapermission){
       return(
         <BarCodeScanner onBarCodeScanned =
          {scanned?undefined:this.handlebarcodescanner}
           style = {StyleSheet.absoluteFillObject}/>
  
       )
     }
     else if (buttonState=== 'normal'){
    
   return(
  <View style = {styles.container}>
    
      <Image source = {require("../assets/booklogo.jpg")}
    style = {{width:40, height:50}}/>  
    <Text>libraryApp</Text> 
    <View style = {styles.inputView}>
  <TextInput style = {styles.inputBox}
    placeholder = "bookid" value={this.state.scannedBookId}/>
    <TouchableOpacity style = {styles.scanButton}onPress = {()=>{
      this.getcamerapermission("bookid")}}>
     <Text style = {styles.buttonText}> scan  </Text>
    </TouchableOpacity>

  </View>

  <View style = {styles.inputView}>
  <TextInput style = {styles.inputBox}
    placeholder = "studentid" 
    value = {this.state.scanStudentid}/>
    <TouchableOpacity style = {styles.scanButton} onPress = {()=>{
      this.getcamerapermission("studentid")
    }}>
     <Text style = {styles.buttonText}> scan  </Text>
    </TouchableOpacity>
    </View>
    <Text>{this.state.transactionmsg}</Text>
   <TouchableOpacity onPress={async()=>{
     var transactionmsg=await this.handleTransaction();
   }}>
     <Text>submit</Text>
   </TouchableOpacity>
    </View>
  
  
   )
   }
   }
  }



const styles = StyleSheet.create({
   container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
   displayText:{ fontSize: 15, textDecorationLine: 'underline' },
    scanButton:{ backgroundColor: '#2196F3', padding: 10, margin: 10 },
     buttonText:{ fontSize: 15, textAlign: 'center', marginTop: 10 },
      inputView:{ flexDirection: 'row', margin: 20 },
       inputBox:{ width: 200, height: 40, borderWidth: 1.5, borderRightWidth: 0, fontSize: 20 },
        scanButton:{ backgroundColor: '#66BB6A', width: 50, borderWidth: 1.5, borderLeftWidth: 0 },
         submitButton:{ backgroundColor: '#FBC02D', width: 100, height:50 },
          submitButtonText:{ padding: 10, textAlign: 'center', fontSize: 20, fontWeight:"bold", color: 'white' } })