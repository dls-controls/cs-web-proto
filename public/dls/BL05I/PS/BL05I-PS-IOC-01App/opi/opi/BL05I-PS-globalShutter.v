$table.parse("BL05I-PS-globalShutter.csv")
#set($dom = "BL05I")
#set($nSerial = 10)
#set($nParIlk = 0)
#set($nParLop = 1)
#set($splitRowId = -1)
#set($title = "PSS - BL05I:LOP 13 G PORT SHUTTER")
#parse("pss_include.v")