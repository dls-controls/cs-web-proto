$table.parse("BL08I-PS-globalShutter.csv")
#set($dom = "BL08I")
#set($nSerial = 10)
#set($nParIlk = 0)
#set($nParLop = 1)
#set($splitRowId = -1)
#set($title = "PSS - BL08I:LOP 13 G PORT SHUTTER")
#parse("pss_include.v")
