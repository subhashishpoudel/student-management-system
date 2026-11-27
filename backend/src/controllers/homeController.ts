import type{Request,Response}from "express";

export function gethome(req:Request,res:Response):void{
  res.send('hello from express');
}

export function getabout(req:Request,res:Response):void{
  res.send('currently studying in National College');
}
