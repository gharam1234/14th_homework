"use client"

import styles from './styles.module.css'
import React from "react";
import Slider from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
// import { useEffect } from "react";
// import { useRouter } from "next/navigation";



export default function LayoutBanner() {
  // const router = useRouter();
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  // useEffect(() => {
  //   if (!localStorage.getItem("accessToken")) {
  //     alert("로그인후 이용가능합니다");
  //     router.push("/login");
  //   }
  // }, []);

  return (


    <div className={styles.slider__container}>

    <Slider {...settings}>
      <div>
        <img src="/images/banner1.png" alt="배너1" />
      </div>
      <div>
        <img src="/images/banner2.png" alt="배너2" />
      </div>
      <div>
        <img src="/images/banner3.png" alt="배너3" />
      </div>
      
    </Slider>

    </div>
  );
}