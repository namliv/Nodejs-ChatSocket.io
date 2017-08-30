var express = require("express");
var app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(3000);

//khai báo 1 mảng user
var mangUsers=[];

//hàm kết nối và hiển thị id username
io.on("connection", function(socket){
  console.log("Co nguoi ket noi " + socket.id);
 
  //(2) server lắng nghe yêu cầu client bằng hàm "on"
  socket.on("client-send-Username", function(data){
    //indexOf duyệt từ vị trí ko, nếu lớn hơn 0 là đã có username
    if(mangUsers.indexOf(data)>=0){
      //faile//gửi thông báo yêu cầu xác nhận client đki thất bại
      socket.emit("server-send-dki-thatbai");
    }else{
      //true//cho phép đăng ký// hàm push() là thêm 1 phẩn từ vào mảng
      mangUsers.push(data);
      //muốn hiện ra tên user chứ ko phải là id
      socket.Username = data;
      //server gửi yêu cầu client xác nhận đăng kí thành công
      socket.emit("server-send-dki-thanhcong", data);
      io.sockets.emit("server-send-danhsach-Users", mangUsers);
    }
  });
  
  //server lắng nghe yêu cầu đăng xuất để xử lý
  socket.on("logout", function(){
    //splice(tìm đến 1 phần từ trong mảng và cut nó đi)
    mangUsers.splice(
      mangUsers.indexOf(socket.Username), 1
    );
    //server yêu cầu client in ra danh sách user cho các thành viên khác xem
    socket.broadcast.emit("server-send-danhsach-Users",mangUsers);
  });

  socket.on("user-send-message", function(data){
    io.sockets.emit("server-send-mesage", {un:socket.Username, nd:data} );
  });

  socket.on("toi-dang-go-chu", function(){
    var s = socket.Username + " dang go chu";
    io.sockets.emit("ai-do-dang-go-chu", s);
  });

  socket.on("toi-stop-go-chu", function(){
    io.sockets.emit("ai-do-STOP-go-chu");
  });


});

app.get("/", function(req, res){
  res.render("trangchu");
});
