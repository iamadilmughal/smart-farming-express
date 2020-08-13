var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Cures = require('../models/Cures');

router.post('/',(req,res,next)=>{
	const cures = new Pests({
		cureId:mongoose.Types.ObjectId(),
		cares:req.body.Cares,
		pesticides:req.body.Pesticides,
		sprays:req.body.Sprays,
	});
	cures.save()
	.then(result=>{
		res.status(200).json({
			Message:"New cure information have been added",
			ID:result.cureId,
			Request:{
				Type:'GET',
				Url:'http://localhost:3000/cures/'+result.cureId
			}
		});
	})
	.catch(err=>{
		res.status(500).json(err);
		console.log(err);
	});
});
router.get('/',(req,res,next)=>{
	Cures
	.find()
	.exec()
	.then(result=>{
		res.status(200).json({
			count:result.length,
			CuresFound:result.map(doc=>{
				return{
					Id:doc.cureId,
					Cares:doc.cares,
					Pesticides:doc.pesticides,
					Sprays:doc.sprays,
					Request:{
						Type:'GET',
						Url:'http://localhost:3000/pests/'+doc.cureId
					}
				}
			})
		});
	})
	.catch(err=>{
		res.status(500).json(err);
	});
});
router.get('/:ID',(req,res,next)=>{
	Pests.findById(req.params.ID).exec().then(doc=>{
		res.status(200).json({
			Id:doc.cureId,
			Cares:doc.cares,
			Pesticides:doc.pesticides,
			Sprays:doc.sprays,
		});
	})
	.catch(err=>{
		res.status(500).json(err);
	});
});
router.delete('/:ID',(req,res,next)=>{
	Pests.remove({_id:req.params.ID}).exec()
	.then(result=>{
		res.status(200).json(result);
	})
	.catch(err=>{
		res.status(500).json(err);
	});
});
router.patch('/',(req,res,next)=>{
	
});
module.exports = router;