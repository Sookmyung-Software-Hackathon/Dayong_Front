import React, { useState, useEffect } from "react";
import axios from 'axios';
import "../css/Navi.css";
import ReactDOM from "react-dom";

export default function Navi(props) {

    useEffect(() => {
        const script = document.createElement("script");
        script.innerHTML = `
        var map;

	    var marker_s, marker_e, marker_p1, marker_p2;
	    var totalMarkerArr = [];
	    var drawInfoArr = [];
	    var resultdrawArr = [];
        var marker;

        function initTmap() {
		// 1. 지도 띄우기
		map = new Tmapv2.Map("map_div", {
			center : new Tmapv2.LatLng(37.570028, 126.989072),
			width : "100%",
			height : "600px",
			zoom : 15,
			zoomControl : true,
			scrollwheel : true
		    });


            // geolocation 사용여부 확인
            if (navigator.geolocation) {

			navigator.geolocation.getCurrentPosition(
				function(position) {
					lat = position.coords.latitude;
					lon = position.coords.longitude;
						
					//팝업 생성
					var content = "<div style=' position: relative; border-bottom: 1px solid #dcdcdc; line-height: 18px; padding: 0 35px 2px 0;'>"
							+ "<div style='font-size: 12px; line-height: 15px;'>"
							+ "<span style='display: inline-block; width: 14px; height: 14px; background-image: url(/resources/images/common/icon_blet.png); vertical-align: middle; margin-right: 5px;'></span>현재위치"
							+ "</div>" + "</div>";

					marker = new Tmapv2.Marker({
						position : new Tmapv2.LatLng(lat,lon),
						map : map
					});

					InfoWindow = new Tmapv2.InfoWindow({
						position : new Tmapv2.LatLng(lat,lon),
						content : content,
						offset : new Tmapv2.Point(0,30),
						type : 2,
						map : map
					});
					map.setCenter(new Tmapv2.LatLng(lat,lon));
					map.setZoom(15);
				});	
		}

        // 2. 시작, 도착 심볼찍기
		// 시작
        if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				function(position) {
					lat = position.coords.latitude;
					lon = position.coords.longitude;

		marker_s = new Tmapv2.Marker(
				{
					position : new Tmapv2.LatLng(lat, lon),
					icon : "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_s.png",
					iconSize : new Tmapv2.Size(24, 38),
					map : map
				});

		// 도착
		marker_e = new Tmapv2.Marker(
				{
					position : new Tmapv2.LatLng(37.57081522, 127.00160213),
					icon : "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_e.png",
					iconSize : new Tmapv2.Size(24, 38),
					map : map
				});

        // 3. 경로탐색 API 사용요청

		    $.ajax({
					method : "POST",
					url : "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json&callback=result",
					async : false,
					data : {
						"appKey" : "l7xxe3815aadfbc44ad2b329bd00a2be4318",
						"startX" : lon,
						"startY" : lat,
						"endX" : "127.00160213",
						"endY" : "37.57081522",
						"reqCoordType" : "WGS84GEO",
						"resCoordType" : "EPSG3857",
						"startName" : "출발지",
						"endName" : "도착지"
					},
					success : function(response) {
						var resultData = response.features;
                        
						//결과 출력
                        var tDistance = ((resultData[0].properties.totalDistance) / 1000).toFixed(1);
                        sessionStorage.setItem('dis', tDistance);
						var tTime = ((resultData[0].properties.totalTime) / 60).toFixed(0);

                        sessionStorage.setItem('time', tTime);

                  $("#result").text(tDistance + tTime);
                        $("#distance").text(tDistance);
                        $("#time").text(tTime);

						
						//기존 그려진 라인 & 마커가 있다면 초기화
						if (resultdrawArr.length > 0) {
							for ( var i in resultdrawArr) {
								resultdrawArr[i].setMap(null);
							}
							resultdrawArr = [];
						}
						
						drawInfoArr = [];

						for ( var i in resultData) { //for문 [S]
							var geometry = resultData[i].geometry;
							var properties = resultData[i].properties;
							var polyline_;


							if (geometry.type == "LineString") {
								for ( var j in geometry.coordinates) {
									// 경로들의 결과값(구간)들을 포인트 객체로 변환 
									var latlng = new Tmapv2.Point(
											geometry.coordinates[j][0],
											geometry.coordinates[j][1]);
									// 포인트 객체를 받아 좌표값으로 변환
									var convertPoint = new Tmapv2.Projection.convertEPSG3857ToWGS84GEO(
											latlng);
									// 포인트객체의 정보로 좌표값 변환 객체로 저장
									var convertChange = new Tmapv2.LatLng(
											convertPoint._lat,
											convertPoint._lng);
									// 배열에 담기
									drawInfoArr.push(convertChange);
								}
							} else {
								var markerImg = "";
								var pType = "";
								var size;

								if (properties.pointType == "S") { //출발지 마커
									markerImg = "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_s.png";
									pType = "S";
									size = new Tmapv2.Size(24, 38);
								} else if (properties.pointType == "E") { //도착지 마커
									markerImg = "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_e.png";
									pType = "E";
									size = new Tmapv2.Size(24, 38);
								} else { //각 포인트 마커
									markerImg = "http://topopen.tmap.co.kr/imgs/point.png";
									pType = "P";
									size = new Tmapv2.Size(8, 8);
								}

								// 경로들의 결과값들을 포인트 객체로 변환 
								var latlon = new Tmapv2.Point(
										geometry.coordinates[0],
										geometry.coordinates[1]);

								// 포인트 객체를 받아 좌표값으로 다시 변환
								var convertPoint = new Tmapv2.Projection.convertEPSG3857ToWGS84GEO(
										latlon);

								var routeInfoObj = {
									markerImage : markerImg,
									lng : convertPoint._lng,
									lat : convertPoint._lat,
									pointType : pType
								};

								// Marker 추가
								marker_p = new Tmapv2.Marker(
										{
											position : new Tmapv2.LatLng(
													routeInfoObj.lat,
													routeInfoObj.lng),
											icon : routeInfoObj.markerImage,
											iconSize : size,
											map : map
										});
							}
						}//for문 [E]
						drawLine(drawInfoArr);
					},
					
				});
            })}
        }

        initTmap();

        function addComma(num) {
      var regexp = /\B(?=(\d{3})+(?!\d))/g;
      return num.toString().replace(regexp, ',');
       }
   
       function drawLine(arrPoint) {
          var polyline_;

          polyline_ = new Tmapv2.Polyline({
             path : arrPoint,
             strokeColor : "#DD0000",
             strokeWeight : 6,
             map : map
          });
          resultdrawArr.push(polyline_);
       }
        `;
        script.type = "text/javascript";
        script.async = "async";
        document.head.appendChild(script);
    }, []);

    const dis = sessionStorage.getItem('dis')
    const time = sessionStorage.getItem('time')
    const point = Number(dis) * 100;

    const [pastPoint, setPastPoint] = useState(0);
    const [currentPoint, setCurrentPoint] = useState(0);

    let config = {
        headers: {
            'Authorization': sessionStorage.getItem('token'),
            'content-type': 'application/json;charset=UTF-8'
        }
    }

    axios.get(`/auth/mypage`, config)
        .then(
            result => {
                setPastPoint(result.data.point)
                setCurrentPoint(Number(pastPoint) + Number(point))
            }
        )

    console.log(pastPoint);
    console.log(currentPoint);

    let data = {
        point: currentPoint
    }

    const onComplete = (e) => {
        axios.patch('/auth/point', data, config)
            .then((result) => {
                console.log(result)
                alert('포인트가 적립되었습니다.')
            })
            .catch(err => console.log(err))
    }

    return (
        <>
            <div id="map_wrap" class="map_wrap3">
                <div id="map_div"></div>
            </div>
            <div className="map_act_btn_wrap clear_box"></div>
            <div className="mapInfo-detail">
                <p>총 거리 : {dis}</p>
                <p>총 시간 : {time}</p>
            </div>
            <p className="possiblePoint">획득 가능 포인트 : {point}</p>
            <br />
            <div className="compelete-btn">
                <button onClick={onComplete}>주문수령완료</button>
            </div>


        </>
    )

}