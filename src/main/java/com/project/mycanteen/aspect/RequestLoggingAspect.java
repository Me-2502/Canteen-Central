package com.project.mycanteen.aspect;

import java.util.Arrays;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class RequestLoggingAspect {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingAspect.class);

    @Pointcut("within(com.project.mycanteen.controller..*)")
    public void controllerMethods() {
    }

    @Around("controllerMethods()")
    public Object logRequest(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        Object[] args = joinPoint.getArgs();

        log.info("Request entering {}.{} with args: {}", className, methodName, Arrays.toString(args));
        try {
            Object result = joinPoint.proceed();
            log.info("Request completed {}.{} -> {}", className, methodName, result != null ? result.getClass().getSimpleName() : "void");
            return result;
        } catch (Throwable ex) {
            log.error("Request failed {}.{} with exception: {}", className, methodName, ex.getMessage(), ex);
            throw ex;
        }
    }

    @AfterThrowing(pointcut = "within(com.project.mycanteen.service..*)", throwing = "exception")
    public void logServiceException(JoinPoint joinPoint, Throwable exception) {
        log.error("Service exception in {}.{}: {}", joinPoint.getSignature().getDeclaringTypeName(), joinPoint.getSignature().getName(), exception.getMessage(), exception);
    }
}
