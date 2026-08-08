package com.svs.wheel_assist;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class WheelAssistApplication {

	public static void main(String[] args) {
		SpringApplication.run(WheelAssistApplication.class, args);
	}

}
